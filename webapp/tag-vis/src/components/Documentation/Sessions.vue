<!-- This component explains to the user how graphs can be saved and shared. It is displayed in the documentation -->
<template>
  <v-container fluid
    ><h1>Keeping and Sharing Results</h1>
    Generated graphs can be saved for later use or shared with others. Sharing
    resulting graphs is the other collaborative aspect of this tool that helps
    users communicate their findings with others. Users can produce and download
    static images of any visualized graph, or generate an interactive session
    that others can access.
    <h3 class="mt-3">Save Graph as PNG</h3>
    Saving images of visualized graphs allows users to easily archive and share
    graphs. Cropped images of a visualized graph can be created by button press
    and downloaded as PNG-file. Thereby it does not matter what is shown on
    screen at the moment, the image is created. Images are created directly from
    the SVG instead of being screenshots and always contain all nodes, edges and
    text labels of the graph. In addition, this allows to change the resolution
    scale to get high resolution PNG-images, where small details are still
    recognizable when zooming in on the image.
    <h3 class="mt-3">Sessions</h3>
    Sessions are snapshots of a graph, that users can return to later and share
    with others. Similar to saving an image, users can press a button to save a
    session of a visualized graph. Sessions are saved to the database and
    comprise all information required to recreate the original visualization.
    That includes highlighted and ignored tags, tag weights and the information
    about who added which paper in case of a group graph. In regular
    visualizations, graphs show the selected subset of documents and their
    relations in their current state. As sessions are snapshots, later changes
    to the included documents will not affect the session's graph. Another
    approach to this would have been to let changes to document tags or changes
    to bibliographic correlation change the graph's edges. Deletion of documents
    should then have resulted in a removal of the respective node to represent
    the collection in it's current state. This approach would have made sessions
    to be more like a list of documents, where a new graph is created, whenever
    loading a session, but it would have always represented documents as they
    are at the moment. To combine the advantages of both approaches, The
    documents included in a session can be re-selected if still present, to
    allow the creation of a new graph with up-to-date information. The newly
    created graph could then be saved again as a new session. Users can share
    their sessions with others via hyperlink. Sessions are viewable by anyone
    who has the link. Being logged in is not required. Sessions can also be
    created and shared by users without an account.
  </v-container>
</template>

<script>
export default {};
</script>

<style>
</style>