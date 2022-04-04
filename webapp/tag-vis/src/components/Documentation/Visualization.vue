<!-- This component explains the graph visualization to the user. It is displayed in the documentation -->
<template>
  <v-container fluid
    ><h1>Visualization</h1>
    The tool visualizes networks of documents and their relations, based on
    different similarity measures covered in
    <a @click="$router.push('/documentation/similarity')">Similarity Measures</a
    >. Networks are laid out using a force-directed layout algorithm.
    <h3 class="mt-3">Nodes</h3>
    Each node in a graph represents a document, nodes are placed in a two
    dimensional space based on the forces that act in the force simulation.
    Nodes are repulsing each other to ensuring a distance between unconnected
    nodes, nodes that are connected have attractive forces acting and pulling
    each other closer together. The node size is determined by the citation
    count of a publication. Papers that had a high impact will therefore stand
    out compared to other nodes because of their size. The area of a node i is
    calculated as
    <v-img
      class="mt-2 mb-2 center"
      src="./../../assets/documentation/equations/node_area.png"
      width="320"
    />where A<sub>base</sub> is a constant defining the base area and C<sub
      >i</sub
    >
    is the citation count of node i.<br />
    Citation counts range from one-digit numbers up to tens of thousands for the
    most cited papers. Log scaling the citation count ensures that differences
    on the lower end are perceptible while nodes of highly cited papers do not
    get too large. Authors and the year of publishing are written next to each
    node, to make represented papers identifiable.
    <h3 class="mt-3">Edges</h3>
    Edges indicate a relationship between the connected nodes and also show how
    strong the relationship is. This is achieved by changing their visual
    appearance and behaviour based on the similarity score between the connected
    documents. The properties of an edge depend on the similarity score of the
    two connected documents, similarity is covered in
    <a @click="$router.push('/documentation/similarity')">Similarity Measures</a
    >.<br />
    Weak edges are bright, this reduces visual clutter on heavily interconnected
    subgraphs and helps users to focus on the strong connections. Weak edges are
    also longer than strong ones, this positions less related documents further
    away from each other and groups of similar documents form dense clusters.
    Edges have a target length, but it can be geometrically impossible to
    arrange the graph in a way that all edges have their intended length.
    Because of this circumstance, edges have different elasticity values
    assigned. Long edges are more elastic than short ones, which results in a
    behaviour that prioritizes positioning similar papers close together.
    <h3 class="mt-3">Interactivity</h3>
    The visualizations are not static, instead there is a variety of
    interactions possible allowing users to analyze networks in more depth.
    Users can interact with the visualization with a mouse. Zooming and panning
    are basic interactions, that allow users to navigate and explore the
    visualized graphs on their own. Zoom is controlled by scroll wheel input,
    graphs can be panned by clicking and holding the left mouse button on any
    white space and moving the mouse. Graphs are drawn as SVG, and allow
    changing the zoom scale without loss of image quality. Hovering the mouse
    pointer over a node highlights this node and all adjacent nodes. This dyes
    the edges connecting highlighted nodes, and highlights involved nodes by
    drawing a border around the nodes and printing the text labels of nodes
    bold. Clicking a node additionally decreases the opacity of non-adjacent
    nodes, including their edges and text labels, to highlight the neighbourhood
    of the clicked node. Nodes can be grabbed and dragged around, to rearrange
    the graph within constraints. The force simulation is still running, when a
    node is let go, the graph will always return to an equilibrium state where
    the acting forces are balanced. Double clicking a node gives the user
    additional information about the paper the node represents. This includes
    title, the full list of authors, publication year, citation count, assigned
    tags and a clickable DOI link redirecting to the external publication
    web page.<br>Force-directed graph layouts can be run as a real time
    simulation of forces, which is done in this tool. This allows to dynamically
    change the data behind a visualization e.g. nodes and edges can be added or
    removed, or edge lengths can be modified. This is used in graphs, that use
    tags as similarity measure and give users even more options to interact with
    the visualizations.
  </v-container>
</template>

<script>
export default {};
</script>

<style>
</style>