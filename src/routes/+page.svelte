<script lang="ts">
	import type { PageProps } from './$types';
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as common from "$lib/common.js";
  import StrapiImage from "$lib/components/strapi-image.svelte";
  import PublicHeader from "$lib/components/public-header.svelte";
  import StrapiMarkdown from "$lib/components/strapi-markdown.svelte";

  let { data }: PageProps = $props();
  let { homeData, services } = data;
  console.log(services);
</script>



<!--
<img src={`http://localhost:1337${data.homeData.splash.formats.medium.url}`} />
-->

<PublicHeader />
<div class="flex flex-col items-center w-screen">
  <section
    class="w-full p-10 flex flex-col xl:flex-row justify-around items-center gap-4"
  >
    <Card.Root class="max-w-200 items-stretch self-auto">
      <Card.Header class="text-4xl container-type-normal">
        <Card.Title class="text-4xl font-semibold">Nails Everywhere</Card.Title>
      </Card.Header>
      <Card.Content class="test-parent">
        <StrapiMarkdown md={homeData.introduction} />
      <!--
        <p class="mb-3">
  Hi, I’m Amber Allak – a passionate nail artist with over 12 years of experience
  in creating custom nails along with hand-drawn nail designs. Nails aren’t just
  a beauty service – they’re an art form and a way to express your unique style.
        </p>

        <p class="my-3">
  I specialize in healthy, beautiful nails using only high-quality products that
  support and promote the health of your natural nails. Cleanliness is a top
  priority in my work — I follow strict sanitation protocols to ensure every tool
  is properly sanitized.
        </p>

        <p class="my-3">
  As a mobile nail technician, I bring the salon experience to you. Whether it’s
  your home, office, or event space, you can enjoy beautiful, personalized nails
  in total comfort and convenience.
        </p>

        <p class="my-3">
  Healthy Custom Nails: Your Style, Your Space.
        </p>
        -->
      </Card.Content>
    </Card.Root>
    <StrapiImage
      image={homeData.splash}
      class="flex-initial lg:shadow-md w-[600px]"
    />
  </section>
  <!-- 
  <section class="bg-[url('https://placehold.co/600x400')] bg-center bg-no-repeat bg-cover w-full h-100 flex flex-row justify-center items-center ">
    <!-- intro with splash image  -- >
    <h1 class="text-4xl font-semibold">Nails Everywhere</h1>
  </section>
  -->
  <section class="w-full flex flex-row justify-center">
    <!-- examples -->
    <Carousel.Root class="w-4/5">
      <Carousel.Content>
        {#each homeData.gallery as image}
          <Carousel.Item class="md:basis-1/2 lg:basis-1/3">
            <div class="p-1 flex-row flex items-center justify-center align-center h-[100%]">
              <StrapiImage
                image={image}
                class="shadow-md w-[400px]"
              />
            </div>
              <!-- 
              <Card.Root>
                <Card.Content
                  class="flex aspect-square items-center justify-center p-6"
                >
                </Card.Content>
              </Card.Root>
  -->
          </Carousel.Item>
        {/each}
      </Carousel.Content>
      <Carousel.Previous class="m-3"/>
      <Carousel.Next class="m-3"/>
    </Carousel.Root>
  </section>
  <!--
  <section>
    <p>self description</p>
  </section>
  -->
  <section class="w-full" id="services">
    <!-- pricing -->
    <!-- Do these as a grid -->
    <h2 class="text-4xl ml-20 p-6">Services</h2>
    <div class="grid xl:grid-cols-2 gap-5 p-6">
      {#each services as service}
        <Card.Root>
        <Card.Header>
          <Card.Title>{service.title}</Card.Title>
          <Card.Description>{service.definedPrice ? `$${service.cost}` : "Custom Pricing"}</Card.Description>
        </Card.Header>
          <Card.Content class="flex flex-col lg:flex-row content-start justify-start">
            <StrapiImage
              image={service.image}
              class="max-sm:w-full sm:w-[400px] max-sm:h-auto sm:h-[200px]"
            />
            <p class="max-lg:py-6 lg:pl-6">{service.description}</p>
          </Card.Content>
        </Card.Root>
  <!--
        <div class="flex flex-col sm:flex-row items-center justify-left">
          <img
            src={service.image}
            alt={"picture of " + service.name}
            class="max-sm:w-full sm:w-[400px] max-sm:h-auto sm:h-[200px]"
          />
          <div class="p-6">
            <h3 class="text-xl">{service.name} {service.price}</h3>
            <p>{service.description}</p>
          </div>
        </div>
          -->
      {/each}
    </div>
  </section>
  <section class="w-full flex-col items-center px-10 mb-10 test-parent">
    <StrapiMarkdown md={homeData.body} />
  </section>
  <!--
  <section class="w-full flex-col items-center px-10 mb-10" id="sanitation">
    <h2 class="text-4xl ml-10 p-6">Sanitation</h2>

    <p class="my-3">I am very passionate about caring for my clients. I would like for you all to have peace of mind for your health during my nail services.</p>

    <p class="my-3">My tools will arrive with me in sanitation bags. Once they have been used, they are placed in a Ziploc bag marked for used tools to be brought home for proper sanitation.</p>

    <p class="my-3">At the end of the day:</p>

    <ul class="list-disc list-inside">
      <li>They are scrubbed with antibacterial soap and warm water</li>
      <li>Thoroughly rinsed to remove any soap residue, as this will cancel the disinfecting agent in the disinfecting solution</li>
      <li>Placed in a Barbacide Jar of disinfecting solution fully immersed for 12 minutes</li>
      <li>Taken out and dried thoroughly</li>
      <li>Placed in my sanitizing cabinet</li>
      <li>Then bagged for added sanitation on my way to you.</li>
    </ul>
  </section>
  <section class="w-full flex-col justify-center items-center px-10 mb-10" id="sanitation">
    <h2 class="text-4xl ml-10 p-6">Services</h2>

    <p class="my-3">I know everyone has a busy schedule, and I will do my best to accommodate your needs.</p>

  <p class="my-3">I ask that you allow a one-hour window from the time of your appointment for my arrival. For Example, if you book at 1pm, I will arrive between 1-2pm.</p>

  <p class="my-3">Parties and events with more than 4 clients will need to be booked in at least two weeks advance. These may occur outside normal business hours. To book a party or event outside of normal hours please call 615-592-6040.</p>
  </section>
  -->
  <!--
  <section
    class="w-full m-10 flex flex-col  items-center my-10 mx-5"
  >
  </section>
  -->
  <section class="w-full flex justify-center items-center mb-[10vh]" id="appointment">
    <!-- button to go to book appointment page -->
    <!--<Button class="p-8">
      <a href="/book" class="text-lg">Book Appointment</a>
    </Button> -->
    <div class="flex flex-col space-y-3">
      <h1 class="text-4xl mb-4">Book an appointment</h1>
      <address class="flex flex-col text-2xl space-y-3 text-[#000000]">
        <Button class="flex">
          <a href="mailto:mynailseverywhere@yahoo.com">mynailseverywhere@yahoo.com</a>
        </Button>
        <Button class="flex">
          <a href="tel:+1615-592-6040">+1 (615) 592‑6040</a>
        </Button>
      </address>
      <Button class="flex">
        <a href={common.squareUpURL}>Book Online</a>
      </Button>
      <!-- Start Square Appointments Embed Code -><script src='https://square.site/appointments/buyer/widget/nryr3yx01d27bt/L8AN6191J5V3E.js'></script><!-- End Square Appointments Embed Code -->
    </div>
    <!-- TODO: setup squared -->
    <!-- availability, contact information, region worked in -->
  </section>
<!-- Make the bottom look less empty -->
</div>
