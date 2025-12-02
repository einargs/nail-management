{
  description = "nail-management";
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-25.05";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";
    services-flake.url = "github:juspay/services-flake";
    globset = {
      url = "github:pdtpartners/globset";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    nixos-generators = {
      url = "github:nix-community/nixos-generators";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, flake-parts, nixpkgs, globset, nixos-generators, ...}@inputs:
    let
      ## VM CONFIG
      # Currently the images for google cloud aren't working.
      # instead I'm just going to use nixos-infect and then
      # nixos-rebuild from inside of that.
      vm-images = let
        system = "x86_64-linux";
        specialArgs = {
          inherit (self.packages.${system}) strapi-server web-server;
        };
        gcloud-ec2-micro-disk = {
          # set disk size to to 10G
          virtualisation.diskSize = 10 * 1024;
        };
        base-modules = [
          {
            nix.registry.nixpkgs.flake = nixpkgs;
          }
          ./nixos-config.nix
        ];
      in {
        nixosConfigurations = {
          # nixos-rebuild build-vm --flake .#prod-server --show-trace
          # ./result/bin/run-nixos-vm
          prod-server = nixpkgs.lib.nixosSystem {
            inherit system specialArgs;
            modules = base-modules;
          };
          # https://github.com/nix-community/nixos-generators
          # nix build .#nixosConfigurations.gcloud-server.config.formats.gce
          gcloud-server = nixpkgs.lib.nixosSystem {
            inherit system specialArgs;
            modules = base-modules ++ [
              nixos-generators.nixosModules.all-formats
              gcloud-ec2-micro-disk
            ];
          };
        };
        gcloud-package = nixos-generators.nixosGenerate {
          inherit system specialArgs;
          format = "raw";
          modules = base-modules ++ [ gcloud-ec2-micro-disk ];
        };
      };
    in flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.process-compose-flake.flakeModule
      ];
      systems = import inputs.systems;

      flake.nixosConfigurations = vm-images.nixosConfigurations;

      perSystem = {self', config, pkgs, lib, system, ...}: {
        # DEV SERVER
        process-compose."dev-server" = {
          imports = [
            inputs.services-flake.processComposeModules.default
          ];
          services.postgres."pg1" = {
            enable = true;
            initialScript.before = ''
              CREATE USER dev WITH password 'dev';
            '';
            initialDatabases = [
              {
                name = "strapi";
                #schemas = [ ./scripts/db.sql ];
              }
              {
                name = "mydb";
                #schemas = [ ./scripts/db.sql ];
              }
            ];
          };
          services.redis."r1" = {
            #enable = true;
            port = 6379;
            #unixSocket = "./redis.sock";
          };
          settings.processes.strapi-dev-server = {
            depends_on."pg1".condition = "process_healthy";
            command = pkgs.writeShellApplication {
              name = "run-strapi";
              runtimeInputs = with pkgs; [ nodejs_22 openssl ];
              text = ''
              cd ./strapi
              npm run dev
              '';
            };
          };
          settings.processes.sveltekit-dev-server = {
            command = pkgs.writeShellApplication {
              name = "run-dev";
              runtimeInputs = with pkgs; [ nodejs_22 openssl ];
              text = "npm run dev";
            };
            # depending on the strapi server makes it never start?
            #depends_on."strapi-dev-server".condition = "process_healthy";
            #depends_on."r1".condition = "process_healthy";
            depends_on."pg1".condition = "process_healthy";
          };
        };


        ## PACKAGES
        # For testing you can use ENV_PATH to point to the .env file
        packages = let
          # use fs.traceVal to debug
          fs = lib.fileset;
        in {
          gcloud-vm = vm-images.gcloud-package;
          strapi-server = pkgs.buildNpmPackage {
            pname = "strapi-server";
            version = "0.0.1";
            src = fs.toSource {
              root = ./strapi;
              fileset = (globset.lib.globs ./strapi [
                "package-lock.json"
                "package.json"
                "favicon.png"
                "server.js"
                "tsconfig.json"
                "src/**/*"
                "types/**/*"
                "config/**/*"
                "database/**/*"
              ]);
            };
            npmDepsHash = "sha256-R+V6KEw/9YnqVil2t/6mXDQgAEUBOARdGRDylC0BIDE=";
            npmFlags = [ "--legacy-peer-deps" ];
            installPhase = ''
              mkdir -p $out
              cp -r * $out/
            '';
          };
          web-server = pkgs.buildNpmPackage {
            pname = "web-server";
            version = "0.0.1";
            src = fs.toSource {
              root = ./.;
              fileset = (globset.lib.globs ./. [
                "selfsigned.crt"
                "selfsigned.key"
                "src/**/*"
                "static/**/*"
                "migrations/**/*"
                "package.json"
                "package-lock.json"
                "svelte.config.js"
                "drizzle.config.ts"
                "vite.config.ts"
                "tsconfig.json"
                "components.json"
                "eslint.config.js"

              ]);
            };
            npmDepsHash = "sha256-KKnvzIhe8/vu4rQzbzqo+1MBl/Lm4A2n/HQ5e1SHVo0=";
            #npmFlags = [ "--legacy-peer-deps" ];
            #npmPackFlags = [ "--ignore-scripts" ];
            buildPhase = ''
            # Necessary, even if the database isn't running
            export DATABASE_URL=postgresql://localhost:5432/mydb
            npm run build
            '';
            # I could shave this using stuff mentioned in
            # https://svelte.dev/docs/kit/adapter-node
            installPhase = ''
              mkdir -p $out
              cp -r ./* $out/
            '';
            #dontNpmBuild = true;
          };
        };


        ## DEV SHELLS
        devShells.default = with pkgs; mkShell {
          # To run commands interacting with the database, just do so from a
          # different terminal; the services aren't isolated.
          inputsFrom = [
            config.process-compose."dev-server".services.outputs.devShell
          ];
          #shellHook = ''
          #'';
          #TEST="${self'.packages.strapi-server}";
          buildInputs = [
          /*
            (pkgs.writeShellScriptBin "web-server" ''
              ${pkgs.nodejs}/bin/node ${self'.packages.web-server}/build
              ${pkgs.nodejs}/bin/npm run start --prefix ${strapi-server}
            '')
            */
            (pkgs.google-cloud-sdk.withExtraComponents
              (with pkgs.google-cloud-sdk.components; [
                gke-gcloud-auth-plugin
              ]))
            prefetch-npm-deps
            nodePackages.typescript-language-server
            firebase-tools
            sqlite
            #dolt
            #python3
            nodejs_22
            #sqlite
            #nodePackages.pnpm
            #prefetch-npm-deps
            openssl
          ];
        };

      };

    };



    /*
    flake-utils.lib.eachDefaultSystem (system: let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      };
    in with pkgs; {
      devShells.default = mkShell {
        buildInputs = [
          nodePackages.typescript-language-server
          firebase-tools
          sqlite
          #dolt
          #python3
          nodejs_22
          #sqlite
          #nodePackages.pnpm
          #prefetch-npm-deps
          openssl
        ];
        src = [
          ./flake.nix
          ./flake.lock
        ];
      };
    });
    */
}
