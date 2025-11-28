const ejs = require("ejs");
const path = require("path");
const { R2XX, R4XX } = require("../Responses");
const { catchAsync, jwtUtils, otpUtils } = require("../utils");
const {
  userService,
  emailService,
  authService,
  otpService,
} = require("../services");
const { OTP_TYPES, TOKENS } = require("../constants");
const { sanitizers } = require("../sanitizers");

const AuthController = {
  login: catchAsync(async (req, res) => {
    const user = await authService.login(req.body);
    if (!user) return R4XX(res, 401, "Incorrect email or password");

    const accessToken = await jwtUtils.issueJWT(
      { _id: user?._id },
      TOKENS.ACCESS,
      TOKENS.ACCESS_EXPIRY
    );

    const refreshToken = await jwtUtils.issueJWT(
      { _id: user?._id },
      TOKENS.REFRESH,
      TOKENS.REFRESH_EXPIRY
    );
    user.refreshTokens = user.refreshTokens.filter(
      (tokenObj) => tokenObj.device_id !== req.device
    );
    user.refreshTokens.push({
      token: refreshToken,
      device_id: req.device,
    });

    if (!user.isEmailVerified) {
      await otpService.deleteOTPs(user._id, OTP_TYPES.EMAILVER);
      const otp = otpUtils.generate();
      await otpService.saveOtp(otp, user, OTP_TYPES.EMAILVER);
      const emailTemplatePath = path.join(
        __dirname,
        "../email-templates/verification.ejs"
      );
      let html = await ejs.renderFile(emailTemplatePath, {
        otp,
      });
      await emailService.sendEmail(user.email, "Verify your email", html);
    }

    await user.save();

    R2XX(
      res,
      `User logged in successfully. ${
        user.isEmailVerified ? "" : " Please check your email for verification."
      }`,
      200,
      {
        user: sanitizers.userSanitizer(user),
        accessToken,
        refreshToken,
      }
    );
  }),
};

module.exports = AuthController;
