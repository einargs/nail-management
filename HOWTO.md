

# Make a migration
```
npm run db:generate -- --name=<name>
```

We programatically apply the migrations during server start up.

# Build the VM for local testing
```
nixos-rebuild build-vm --flake .#prod-server
```

Then run it with
```
./result/bin/run-nixos-vm
```
