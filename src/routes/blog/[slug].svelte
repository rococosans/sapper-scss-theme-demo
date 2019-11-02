<script context="module">
  import client from "../../apollo.js";
  import { gql } from "apollo-boost";

  const FILE_BY_SLUG_QUERY = gql`
    query FILE_BY_SLUG_QUERY($input: FileSrc) {
      fileBySlug(input: $input) {
        metadata
        slug
        file
        content
      }
    }
  `;

  export async function preload(page) {
    const { slug } = await page.params;

    return {
      cache: await client.query({
        query: FILE_BY_SLUG_QUERY,
        variables: {
          input: {
            source_dir: "content/blog",
            // slug: slug
            slug: "2019-03-04-svelte-native-quick-start"
          }
        }
      }),
      slug
    };
  }
</script>

<script>
  import { onMount } from "svelte";
  import { query } from "svelte-apollo";

  let slug;
  $: slug = $$props.slug;

  const post = query(client, {
    query: FILE_BY_SLUG_QUERY,
    variables: {
      input: {
        source_dir: "content/blog",
        // slug: slug
        slug: "2019-03-04-svelte-native-quick-start"
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
  {JSON.parse(result.data.fileBySlug.metadata).title}
</h1>

<article>
  {@html result.data.fileBySlug.content}
</article>

{:catch error}
<p>Error: {error}</p>
{/await}
