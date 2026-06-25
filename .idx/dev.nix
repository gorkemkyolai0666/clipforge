{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
  ];
  idx = {
    extensions = [
      "vscodevim.vim"
    ];
    workspace = {
      onCreate = {
        npm-install = "cd frontend && npm install";
      };
      onStart = {
        run-server = "cd frontend && npm run dev";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
          cwd = "frontend";
        };
      };
    };
  };
}