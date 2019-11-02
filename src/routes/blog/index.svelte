<script context="module">
  import client from "../../apollo.js";
  import { gql } from "apollo-boost";

  const FILES_BY_DIR_QUERY = gql`
    query FILES_BY_DIR_QUERY($input: SrcDir) {
      filesByDirectory(input: $input) {
        metadata
        slug
      }
    }
  `;

  export async function preload(page, session) {
    return {
      cache: await client.query({
        query: FILES_BY_DIR_QUERY,
        variables: {
          input: {
            source_dir: "src/content/blog"
          }
        }
      })
    };
  }
</script>

<script>
  let posts = $$props.cache.data.filesByDirectory;
</script>

<svelte:head>
  <title>Blog</title>
</svelte:head>

<h1>Recent posts</h1>

{#await posts}
<p>Loading...</p>
{:then result}

<ul>
  {#each posts as post }
  <li>
    <a rel="prefetch" href="{post.slug}">
      {JSON.parse(post.metadata).title}
    </a>
  </li>
  {/each}
</ul>

{:catch error}
<p>Error: {error}</p>
{/await}

<style>
  ul {
    margin: 0 0 1em 0;
    line-height: 1.5;
  }
</style>
