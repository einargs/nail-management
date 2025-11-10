{ pkgs, strapi-server, web-server, ... }:


{
  system.stateVersion = "25.05";

  boot.loader.systemd-boot.enable = true;

  boot.loader.efi.canTouchEfiVariables = true;
  users.users.test = {
    isNormalUser = true;
    extraGroups = [ "wheel" ];
    initialPassword = "test";
  };
  virtualisation.vmVariant = {
    virtualisation.forwardPorts = [
      { from = "host"; host.port = 8080; guest.port = 80; }
      { from = "host"; host.port = 8337; guest.port = 1337; }
      #{ from = "host"; host.port = 8022; guest.port = 22; }
    ];
    #services.openssh.enable = true;
    virtualisation.memorySize = 8096;
    virtualisation.diskSize = 50000;
    # This might need to be on the host?
    virtualisation.qemu.options = [
      "-nographic"
    ];
  };


  environment.systemPackages = with pkgs; [
    vim 
  ];
  networking.firewall.allowedTCPPorts = [ 22 80 ];
  services.postgresql = {
    enable = true;
    ensureDatabases = [ "mydb" "strapi" ];
    # This talks about ways to do nice authentication:
    # https://wiki.nixos.org/wiki/PostgreSQL
    authentication = pkgs.lib.mkOverride 10 ''
    #type database DBuser origin-address auth-method
    local all      all     trust
    '';
  };
  # Service is still called redis
  # This is the default instance.
  services.redis.servers."" = {
    enable = true;
    port = 6379;
  };
  # journalctl -u <service-name> for logs
  # systemctl status <service-name> for status
  # These run as root by default
  systemd.services.strapi-server = {
      description = "Strapi Server";
      enable = true;
      requires = [ "postgresql.service" ];
      wantedBy = [ "multi-user.target" ]; # Ensures the service starts with the system
      after = [ "network.target" ];       # Ensures network is available before starting
      environment = {
        NODE_ENV="production";
        HOST="0.0.0.0";
        PORT="1337";
        DATABASE_CLIENT="postgres";
        DATABASE_URL="postgres://postgres:/strapi?host=/var/run/postgresql/";
      };
      serviceConfig = {
        # We're using the unix socket to connect, since that's faster
        # and safer.
        # TODO: move this to /etc
        EnvironmentFile = "/home/test/strapi-server.env";
        /*
        pkgs.writeText "strapi-env" ''
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
DATABASE_CLIENT=postgres
DATABASE_URL=postgres://postgres:/strapi?host=/var/run/postgresql/
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_SSL=false
'';
*/
        WorkingDirectory = "${strapi-server}";
        Type = "simple";                  # Or "forking", "oneshot", etc. depending on your service
        #User = "youruser";                # The user the service runs as
        #Group = "yourgroup";              # The group the service runs as
        # Seems to be a problem with this command
        ExecStart = ''
          ${pkgs.nodejs}/bin/node ./server.js
        '';
        # Or, if you have a script: ExecStart = "${pkgs.writeScript "my-script" ''#!${pkgs.bash}/bin/bash\n/path/to/your/script.sh''}";
      };
  };
  # TODO: make this restart
  systemd.services.web-server = {
      enable = true;
      description = "Production Server";
      requires = [
        "postgresql.service"
        "redis.service"
        "strapi-server.service"
      ];
      wantedBy = [ "multi-user.target" ]; # Ensures the service starts with the system
      after = [ "network.target" ];       # Ensures network is available before starting

      environment = {
        PORT="80";
        NODE_ENV="production";
        DATABASE_URL="postgresql://postgres:/mydb?host=/var/run/postgresql/";
        STRAPI_URL="http://localhost:1337";
      };

      serviceConfig = {
        # TODO: move the DATABASE_URL and such back into this
        EnvironmentFile = "/home/test/web-server.env";
        /*
        '';*/
        WorkingDirectory = "${web-server}";
        Type = "simple";                  # Or "forking", "oneshot", etc. depending on your service
        #User = "youruser";                # The user the service runs as
        #Group = "yourgroup";              # The group the service runs as
        ExecStart = ''
          ${pkgs.nodejs}/bin/node ./build
        '';
        # Or, if you have a script: ExecStart = "${pkgs.writeScript "my-script" ''#!${pkgs.bash}/bin/bash\n/path/to/your/script.sh''}";
      };
    };
}
