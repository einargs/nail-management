<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import {type Appointment, type Client} from "$lib/server/db/schema";

  let { appointment, client }: { 
    client: Client,
    appointment: Appointment
  } = $props();
</script>


<Card.Root>
  <Card.Header>
    <Card.Title>{client.name}</Card.Title>
    <Card.Description>Appointment at {appointment.date}</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Card Content</p>
  </Card.Content>
  <Card.Footer>
    <p>Card Footer</p>
  </Card.Footer>
</Card.Root>
