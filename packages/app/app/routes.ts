import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/djed", "routes/djed.tsx"),
  route("/shen", "routes/shen.tsx"),
] satisfies RouteConfig
