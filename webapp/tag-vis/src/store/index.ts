import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const getDefaultState = () => {
  return {
    user_data: {
      user_id: '',
      is_logged_in: false,
      display_name: '',
      photo_url: null,
      access_token: '',
      account_type: '',
      created: '',
      settings: {
        dark_theme: false,
        multi_expand: false,
        number_of_table_rows: "10",
        png_resolution_scale: "2",
        node_size_citation_count: true,
        add_semantic_scholar_topics_to_graphs: true,
        default_graph_type: "Tags"
      }
    },
    show_login_dialog: false,
    documents: [],
    selected_documents: [],
    show_tag_preferences: false,
    graph: {},
    graph_type: "Tags",
    graph_type_items: ["Tags", "Bibliographic Correlations", "Direct Citation"],
    is_graph_forces_on: true,
    is_vis_exploration_drawer: false,
    session: {
      //tags: {name: "", weight: 50, isHighlighted: false, isIgnored: false}
    },
    // gets true, when graph was loaded from a session
    is_loaded_session: false,
    document_details: {
      isVisible: false,
      document: {}
    },
    is_help_visible: false,
    is_lenses_visible: false,
    active_lense: "default",
    active_lense_items: ["default", "relevance", "age"],
    is_svg_initialized: false,
    is_library_loaded: false,
  }
}
export default new Vuex.Store({
  state: getDefaultState(),
  mutations: {
    resetState(state) {
      Object.assign(state, getDefaultState())
    },
    change_user_id(state, user_id) {
      state.user_data.user_id = user_id
    },
    change_is_logged_in(state, is_logged_in) {
      state.user_data.is_logged_in = is_logged_in
    },
    change_display_name(state, display_name) {
      state.user_data.display_name = display_name
    },
    change_photo_url(state, photo_url) {
      state.user_data.photo_url = photo_url
    },
    change_access_token(state, access_token) {
      state.user_data.access_token = access_token
    },
    change_user_created(state, created) {
      state.user_data.created = created
    },
    change_account_type(state, account_type) {
      state.user_data.account_type = account_type
    },
    change_show_login_dialog(state, bool) {
      state.show_login_dialog = bool
    },
    change_documents(state, documents) {
      state.documents = documents
    },
    add_documents(state, documents) {
      state.documents = state.documents.concat(documents)
    },
    change_selected_documents(state, selected_documents) {
      state.selected_documents = selected_documents
    },
    change_show_tag_preferences(state, show_tag_preferences) {
      state.show_tag_preferences = show_tag_preferences
    },
    change_graph(state, graph) {
      state.graph = graph
    },
    change_graph_type(state, graph_type) {
      state.graph_type = graph_type
    },
    change_session(state, session) {
      state.session = session
    },
    change_is_vis_exploration_drawer(state, is_vis_exploration_drawer) {
      state.is_vis_exploration_drawer = is_vis_exploration_drawer
    },
    change_is_loaded_session(state, is_loaded_session) {
      state.is_loaded_session = is_loaded_session
    },
    change_document_details(state, document_details) {
      state.document_details = document_details
    },
    change_is_help_visible(state, is_help_visible) {
      state.is_help_visible = is_help_visible
    },
    change_is_lenses_visible(state, is_lenses_visible) {
      state.is_lenses_visible = is_lenses_visible
    },
    change_active_lense(state, active_lense) {
      state.active_lense = active_lense
    },
    change_is_svg_initialized(state, is_svg_initialized) {
      state.is_svg_initialized = is_svg_initialized
    },
    change_settings(state, settings) {
      state.user_data.settings = settings
    },
    change_is_graph_forces_on(state, is_graph_forces_on){
      state.is_graph_forces_on = is_graph_forces_on
    },
    change_is_library_loaded(state, is_library_loaded){
      state.is_library_loaded = is_library_loaded
    }
  },
  getters: {
    get_user_id: state => {
      return state.user_data.user_id
    },
    is_logged_in: state => {
      return state.user_data.is_logged_in
    },
    get_display_name: state => {
      return state.user_data.display_name
    },
    get_photo_url: state => {
      return state.user_data.photo_url
    },
    get_access_token: state => {
      return state.user_data.access_token
    },
    get_show_login_dialog: state => {
      return state.show_login_dialog
    },
    get_user_created: state => {
      return state.user_data.created
    },
    get_account_type: state => {
      return state.user_data.account_type
    },
    get_documents: state => {
      return state.documents
    },
    get_selected_documents: state => {
      return state.selected_documents
    },
    get_show_tag_preferences: state => {
      return state.show_tag_preferences
    },
    get_graph: state => {
      return state.graph
    },
    get_graph_type: state => {
      return state.graph_type
    },
    get_graph_type_items: state => {
      return state.graph_type_items
    },
    get_session: state => {
      return state.session
    },
    get_is_vis_exploration_drawer: state => {
      return state.is_vis_exploration_drawer
    },
    get_is_loaded_session: state => {
      return state.is_loaded_session
    },
    get_document_details: state => {
      return state.document_details
    },
    get_is_help_visible: state => {
      return state.is_help_visible;
    },
    get_is_lenses_visible: state => {
      return state.is_lenses_visible;
    },
    get_active_lense: state => {
      return state.active_lense;
    },
    get_active_lense_items: state => {
      return state.active_lense_items;
    },
    get_is_svg_initialized: state => {
      return state.is_svg_initialized;
    },
    get_settings: state => {
      return state.user_data.settings;
    },
    get_is_graph_forces_on: state => {
      return state.is_graph_forces_on;
    },
    get_is_library_loaded: state => {
      return state.is_library_loaded;
    }
  }
})
