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

  export async function preload({ params }) {
    return {
      cache: await client.query({
        query: FILE_BY_SLUG_QUERY,
        variables: {
          input: {
            source_dir: "content/blog",
            //! fix the way the slug is being parsed
            slug: `2019-${params.slug}`
          }
        }
      })
    };
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
