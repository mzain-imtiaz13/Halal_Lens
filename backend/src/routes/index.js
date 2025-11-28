const { Router } = require("express");

const router = Router();
// const authRoutes = require("./auth.routes");

const defaultRoutes = [
  // {
  //   path: "/auth",
  //   route: authRoutes,
  // },
];

defaultRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

module.exports = router;
