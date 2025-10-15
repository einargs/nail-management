{
  description = "HackMT";
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";

  };
  outputs = { self, nixpkgs, flake-utils }:
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
}
