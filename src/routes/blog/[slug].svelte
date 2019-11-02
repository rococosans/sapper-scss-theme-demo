<script context="module">
  import client from "../../apollo.js";
  import { gql } from "apollo-boost";

  const FILE_BY_NAME_QUERY = gql`
    query FILE_BY_NAME_QUERY($input: FileSrc!) {
      fileByName(input: $input) {
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
        query: FILE_BY_NAME_QUERY,
        variables: {
          input: {
            source_dir: "content/blog",
            file_name: slug
          }
        }
      }),
      slug
    };
  }
</script>

<script>
  import { query } from "svelte-apollo";

  $: slug = $$props.slug;

  const post = query(client, {
    query: FILE_BY_NAME_QUERY,
    variables: {
      input: {
        source_dir: "content/blog",
        file_name: "slug"
      }
    }
  });
</script>

<svelte:head>
  <title>Blog</title>
</svelte:head>

{#await $post}
<p>Loading...</p>
{:then result}

<h1>
  {JSON.parse(result.data.fileByName.metadata).title}
</h1>

<article>
  {@html result.data.fileByName.content}
</article>

{:catch error}
<p>Error: {error}</p>
{/await}

<style>
  ul {
    margin: 0 0 1em 0;
    line-height: 1.5;
  }
</style>
