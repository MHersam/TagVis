<!-- This component explains groups to the user and is displayed in the documentation -->
<template>
  <v-container fluid
    ><h1>Groups</h1>
    Groups are shared document libraries to which multiple users can contribute
    to. Groups enable users to share papers and to combine documents provided by
    different users in one graph. Users join a group from the group's page that
    is accessible by following a hyperlink. Members can add new papers from
    other groups or from their personal library. Members can also change tags of
    group documents which allows users to collectively build a library of tagged
    papers. Group documents can directly be included in visualizations, or added
    to a personal library to mix them with other documents. Visitors without an
    account are able to see the documents in a group as well and can generate
    visualization from them if they have the link. When adding a document to a
    group, only a reference to the document is adopted. Changing the tags of a
    document in one place will change all occurrences across all groups and the
    original document in the personal library of the owner is also affected.
    This allows a document to stay synchronized across different groups. A
    document is always owned by exactly one user. When adding a document from a
    group to a personal library, the document is duplicated. When documents from
    multiple users are included in a visualization, which user added which paper
    is also visualized in graphs by dyeing nodes accordingly. Each user gets a
    color from a color spectrum assigned and the documents added by a specific
    user are then dyed in their corresponding color. The choice of a continuous
    color scale over a set of categorical colors has the advantage, that the
    maximum number of users representable by different colors is not limited by
    the number of elements in a categorical color set.</v-container
  >
</template>

<script>
export default {};
</script>

<style>
</style>