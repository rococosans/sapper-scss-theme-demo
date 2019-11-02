# Svelte Themeability

[WIP]

## Current implementation: query for a list of blog posts

```js
<script context="module">
  import client from "../../apollo.js";
  import { gql } from "apollo-boost";

  const FILES_BY_DIR_QUERY = gql`
    query FILES_BY_DIR_QUERY($input: SrcDir) {
      filesByDirectory(input: $input) {
        file
        metadata
        slug
        content
      }
    }
  `;

  export async function preload() {
    return {
      cache: await client.query({
        query: FILES_BY_DIR_QUERY,
        variables: {
          input: {
            source_dir: "content/blog"
          }
        }
      })
    };
  }
</script>

<script>
  import { query } from "svelte-apollo";

  const posts = query(client, {
    query: FILES_BY_DIR_QUERY,
    variables: {
      input: {
        source_dir: "content/blog"
      }
    }
  });
</script>
```

## Proposed implementation: query for a list of blog posts

```js
<script gql="query">
  query FILES_BY_DIR_QUERY($input: SrcDir) {
    filesByDirectory(input: $input) {
      file
      metadata
      slug
      content
    }
  }

  const posts = {
    query: FILES_BY_DIR_QUERY,
    variables: {
      input: {
        source_dir: "content/blog"
      }
    }
  }
</script>
```
