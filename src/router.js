import Vue from "vue";
import VueRouter from "vue-router";
import ReportList from "@/views/ReportList";
import Annotation from "@/views/Annotation";

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        redirect: '/report_list'
    }, {
        path: "/report_list",
        component: ReportList
    }, {
        path: "/annotation",
        component: Annotation
    }
]

let router = new VueRouter({
    routes
})
export default router;