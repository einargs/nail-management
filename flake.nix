{
  description = "nail-management";
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-25.05";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";
    services-flake.url = "github:juspay/services-flake";

  };
  outputs = { self, flake-parts, nixpkgs, ...}@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.process-compose-flake.flakeModule
      ];
      systems = import inputs.systems;
      perSystem = {self', config, pkgs, lib, system, ...}: {
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
                name = "mydb";
                #schemas = [ ./scripts/db.sql ];
              }
            ];
          };
          services.redis."r1" = {
            enable = true;
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
            depends_on."r1".condition = "process_healthy";
            depends_on."pg1".condition = "process_healthy";
          };
        };
        # For testing you can use ENV_PATH to point to the .env file
        packages.strapi-server = pkgs.buildNpmPackage {
          pname = "strapi-server";
          version = "0.0.1";
          src = ./strapi;
          npmDepsHash = "sha256-R+V6KEw/9YnqVil2t/6mXDQgAEUBOARdGRDylC0BIDE=";
          npmFlags = [ "--legacy-peer-deps" ];
          installPhase = ''
            mkdir -p $out
            cp -r * $out/
          '';
        };
        packages.web-server = pkgs.buildNpmPackage {
          pname = "web-server";
          version = "0.0.1";
          src = lib.sources.cleanSourceWith {
            src = lib.sources.cleanSourceWith {
              src = ./.;
              filter = lib.sources.cleanSourceFilter;
            };
            filter = path: type: !(builtins.any
              (suffix: lib.strings.hasSuffix suffix path)
              ["flake.nix" "flake.lock"]);

          };
          # I need to get the filtering right
          /*
          src = lib.sources.sourceByRegex ./. [
            #exclude = [ "node_modules" "build" "result" "flake.nix" "flake.lock" "strapi" "data" "*.qcow2" ];
              "src/*"
              "static/*"
              "drizzle.config.ts"
              "package.json"
              "package-lock.json"
              "vite.config.ts"
              "tsconfig.json"
              "components.json"
              "eslint.config.js"
          ];
          */
          npmDepsHash = "sha256-qmiHkGUk11thaUBCYNMGxdTp9ZZgBfBUVUEgbKhRWeI=";
          #npmPackFlags = [ "--ignore-scripts" ];
          buildPhase = ''
          export DATABASE_URL=postgresql://localhost:5432/mydb
          npm run build
          '';
          # I could shave this using stuff mentioned in
          # https://svelte.dev/docs/kit/adapter-node
          installPhase = ''
            mkdir -p $out
            cp -r * $out/
          '';
          #dontNpmBuild = true;
        };
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
      # To deploy we're going to have a nixos config
      # nixos-rebuild build-vm --flake .#prod-server --show-trace
      # ./result/bin/run-nixos-vm
      flake.nixosConfigurations.prod-server = let 
        system = "x86_64-linux";
      in nixpkgs.lib.nixosSystem {
        inherit system;
        specialArgs = {
          inherit (self.packages.${system}) strapi-server web-server;
        };
        modules = [
          ./nixos-config.nix
        ];
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
