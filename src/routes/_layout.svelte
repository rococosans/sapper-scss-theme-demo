<script>
  import Nav from "../components/Nav.svelte";

  export let segment;
</script>

<style lang="scss" global>
  @import "./styles/global.scss";
  @import "./styles/theme.scss";

  main {
    position: relative;
    max-width: $width;
    background-color: white;
    padding: 2em;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>

<Nav {segment}></Nav>

<main>
  <slot></slot>
</main>
