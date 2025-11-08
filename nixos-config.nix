{ pkgs, ... }:

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
    ];
    virtualisation.memorySize = 8096;
    virtualisation.diskSize = 50000;
  };


  environment.systemPackages = with pkgs; [
    vim 
  ];
  networking.firewall.allowedTCPPorts = [ 22 80 ];
  services.postgresql = {
    enable = true;
    ensureDatabases = [ "mydb" ];
  };
  services.redis.servers."r1" = {
    enable = true;
    port = 6379;
  };
}
