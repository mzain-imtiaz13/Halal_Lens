const { Router } = require("express");

const router = Router();
const billingRoutes = require("./billing.routes");

const defaultRoutes = [
  {
    path: "/billing",
    route: billingRoutes,
  },
];

defaultRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

module.exports = router;
