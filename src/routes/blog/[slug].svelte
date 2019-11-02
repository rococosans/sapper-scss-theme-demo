<script context="module">
  import client from "../../apollo.js";
  import { gql } from "apollo-boost";

  const FILE_BY_SLUG_QUERY = gql`
    query FILE_BY_SLUG_QUERY($input: FileSrc) {
      fileBySlug(input: $input) {
        metadata
        content
      }
    }
  `;

  export async function preload({ params }) {
    const cache = await client.query({
      query: FILE_BY_SLUG_QUERY,
      variables: {
        input: {
          source_dir: "src/content/blog",
          slug: params.slug
        }
      }
    });

    return { cache };
  }
</script>

<script>
  let post = $$props.cache.data.fileBySlug;
</script>

<svelte:head>
  <title>Blog</title>
</svelte:head>

{#await post}
<p>Loading...</p>
{:then result}

<h1>
  {JSON.parse(post.metadata).title}
</h1>

<article>
  {@html post.content}
</article>

{:catch error}
<p>Error: {error}</p>
{/await}
