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
              text = "npx vite dev";
            };
            depends_on."strapi-dev-server".condition = "process_healthy";
            depends_on."r1".condition = "process_healthy";
            depends_on."pg1".condition = "process_healthy";
          };
        };
        packages.strapi-server = pkgs.buildNpmPackage {
          pname = "strapi-server";
          version = "0.0.1";
          src = ./strapi;
          npmDepsHash = "sha256-R+V6KEw/9YnqVil2t/6mXDQgAEUBOARdGRDylC0BIDE=";
          npmFlags = [ "--legacy-peer-deps" ];
        };
        packages.web-server = pkgs.buildNpmPackage {
          pname = "web-server";
          version = "0.0.1";
          src = ./.;
          npmDepsHash = "sha256-lC29Z1RADZpUR8hfA2W90oC+o2bVglxPw10ToFFzJz8=";
          #npmPackFlags = [ "--ignore-scripts" ];
          #npmBuildScript = "npx vite build";
          buildPhase = ''
          npm run build
          '';
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
         shellHook = ''
         source ./.env
         PS_CONNECT=psql $DATABASE_URL
         '';
#
#        ${bg_service} &
#        BG_PID=$!
#        
#        trap "kill -9 $BG_PID" EXIT
#          ''
          buildInputs = [
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
      flake.nixosConfigurations.prod-server = let 
        system = "x86_64-linux";
      in nixpkgs.lib.nixosSystem {
        inherit system;
        modules = [
          ./nixos-config.nix
          {

  systemd.services.strapi-server = {
      description = "Strapi Server";
      requires = [ "postgresql.service" ];
      wantedBy = [ "multi-user.target" ]; # Ensures the service starts with the system
      after = [ "network.target" ];       # Ensures network is available before starting
      serviceConfig = {
        Type = "simple";                  # Or "forking", "oneshot", etc. depending on your service
        #User = "youruser";                # The user the service runs as
        #Group = "yourgroup";              # The group the service runs as
        ExecStart = ''
          ${self.packages.${system}.strapi-server}/bin/strapi-server
        '';
        # Or, if you have a script: ExecStart = "${pkgs.writeScript "my-script" ''#!${pkgs.bash}/bin/bash\n/path/to/your/script.sh''}";
      };
  };
  systemd.services.web-server = {
      description = "Production Server";
      requires = [ "postgresql.service" "r1.service"
      "strapi-server.service"
      ];
      wantedBy = [ "multi-user.target" ]; # Ensures the service starts with the system
      after = [ "network.target" ];       # Ensures network is available before starting

      serviceConfig = {
        Type = "simple";                  # Or "forking", "oneshot", etc. depending on your service
        #User = "youruser";                # The user the service runs as
        #Group = "yourgroup";              # The group the service runs as
        ExecStart = ''
          ${self.packages.${system}.web-server}/bin/web-server
        '';
        # Or, if you have a script: ExecStart = "${pkgs.writeScript "my-script" ''#!${pkgs.bash}/bin/bash\n/path/to/your/script.sh''}";
      };
    };
          }
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
