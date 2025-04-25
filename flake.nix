{
  description = "reverse-djed";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";

    liqwid-nix = {
      url = "github:Liqwid-Labs/liqwid-nix/v2.9.1";
      inputs.nixpkgs-latest.follows = "nixpkgs-latest";
    };

    nixpkgs.url = "github:NixOS/nixpkgs";
    nixpkgs-latest.url =
      "github:NixOS/nixpkgs?rev=a2494bf2042d605ca1c4a679401bdc4971da54fb";

  };

  outputs = inputs@{ self, liqwid-nix, flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.liqwid-nix.flakeModule ];
      systems =
        [ "x86_64-linux" "aarch64-darwin" "x86_64-darwin" "aarch64-linux" ];

      perSystem = { config, pkgs', self', inputs', system, ... }:
        let
          pkgs = import inputs.nixpkgs {
            inherit system;

            overlays = [ ];
          };
        in
        {
          devShells.default = pkgs.mkShell {
            buildInputs = [
              pkgs.bun
              pkgs.nodejs
              pkgs.typescript-language-server
              pkgs.vscode-langservers-extracted
              pkgs.prettierd
              pkgs.nodePackages.ts-node
              pkgs.google-cloud-sdk
            ];

            # We unset NODE_PATH here, because it means node_modules is local, 
            # which is how non-nix users experience it too.
            shellHook = ''
              unset NODE_PATH
            '';
          };
        };

      flake.hydraJobs.x86_64-linux =
        (self.checks.x86_64-linux // self.packages.x86_64-linux);
    };
}
