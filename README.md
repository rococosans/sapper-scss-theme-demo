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

  export async function preload(page, session) {
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
  let posts = $$props.cache.data.filesByDirectory;
</script>
```

## Proposed implementation: query for a list of blog posts

```js
<script gql="query">
  const posts = query FILES_BY_DIR_QUERY($input: SrcDir) {
    filesByDirectory(input: $input) {
      file
      metadata
      slug
      content
    },
    variables: {
      input: {
        source_dir: "content/blog"
      }
    }
  }
</script>
```

You can imagine a preprocessor that could dynamically generating the schema based on the fields you pass to the query. If it's only handling text files I could see it being simplified even more.

Some settings in the rollup config or a sapper config file to aggregate the filesystem queries and handle parsing of files. The src/api folder could be tucked away with methods for parsing specific file types built in.

```js
<script gql="query">
  const posts = filesByDirectory {
    file
    metadata
    slug
    content
  }
</script>
```