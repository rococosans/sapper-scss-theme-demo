<script context="module">
  import client from "../../apollo.js";
  import { gql } from "apollo-boost";

  const GET_FILES = gql`
    query GET_FILES($input: FileSrc!) {
      get_files(input: $input) {
        file
        metadata
        slug
        content
      }
    }
  `;

  export async function preload(page) {
    const { slug } = page.params;

    return {
      cache: await client.query({
        query: GET_FILES,
        variables: {
          input: {
            source_dir: "content/blog",
            anchor_base_url: "blog"
          }
        }
      }),
      postTitle: slug
    };
  }
</script>

<script>
  import { query } from "svelte-apollo";

  $: postTitle = $$props.postTitle;

  const posts = query(client, {
    query: GET_FILES,
    variables: {
      input: {
        source_dir: "content/blog",
        anchor_base_url: "blog"
      }
    }
  });
</script>

<svelte:head>
  <title>Blog</title>
</svelte:head>

<h1>
  {postTitle}
</h1>

{#await $posts}
<p>Loading...</p>
{:then result}

<ul>
  {#each result.data.get_files as post }
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
