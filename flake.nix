{
  description = "nail-management";
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-25.05";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";
    services-flake.url = "github:juspay/services-flake";

  };
  outputs = { flake-parts, ...}@inputs:
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
          settings.processes.sveltekit-dev-server = {
            command = pkgs.writeShellApplication {
              name = "run-dev";
              runtimeInputs = with pkgs; [ sqlite nodejs_22 openssl ];
              text = "npx vite dev";
            };
            depends_on."r1".condition = "process_healthy";
            depends_on."pg1".condition = "process_healthy";
          };
        };
        devShells.default = with pkgs; mkShell {
          # To run commands interacting with the database, just do so from a
          # different terminal; the services aren't isolated.
          inputsFrom = [
            config.process-compose."dev-server".services.outputs.devShell
          ];
#          shellHook = ''
#
#        ${bg_service} &
#        BG_PID=$!
#        
#        trap "kill -9 $BG_PID" EXIT
#          ''
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
