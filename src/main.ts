import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import App from "./App.vue";
import "./index.css";

library.add(faUser);

const app = createApp(App);

// app.use(router);

app.component("font-awesome-icon", FontAwesomeIcon).mount("#app");
