import { AuthController } from "../src/controller/AuthController";
import { AuthenticationService } from "../src/service/Authentication.service";
import { UserService } from "../src/service/userService";
import { EmailService } from "../src/service/Emailservice";
import { BadRequestException } from "../src/util/exceptions/http/BadRequestException";
import { jest, describe, expect, beforeEach, it ,afterEach} from '@jest/globals';

describe("AuthController", () => {
  let authService: jest.Mocked<AuthenticationService>;
  let userService: jest.Mocked<UserService>;
  let emailService: jest.Mocked<EmailService>;
  let controller: AuthController;

  let req: any;
  let res: any;

  beforeEach(() => {
    authService = {
      persistAuthentication: jest.fn(),
      logout: jest.fn(),
      persistReset: jest.fn(),
      getRepo: jest.fn(),
       verifyResetToken: jest.fn(),
      clearResetToken :jest.fn()
    } as any;

    userService = {
      validate: jest.fn(),
      updatedLoggedUser: jest.fn(),
      get_user_bymail: jest.fn(),
    
      updateuserpass: jest.fn()
    } as any;

    emailService = {
      sendPasswordResetEmail: jest.fn()
    } as any;

    controller = new AuthController(authService, userService, emailService);

    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      clearCookie: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================================
  // LOGIN
  // ================================

  describe("login", () => {

    it("should throw if email or password missing", async () => {
      req.body = { email: "" };

      await expect(controller.login(req, res))
        .rejects
        .toThrow(BadRequestException);
    });

    it("should login successfully", async () => {
      const fakeUser = { id: "123", role: "user", email: "test@mail.com" };

      req.body = { email: "test@mail.com", password: "123456" };

      userService.validate.mockResolvedValue(fakeUser as any);

      await controller.login(req, res);

      expect(userService.validate).toHaveBeenCalled();
      expect(authService.persistAuthentication).toHaveBeenCalled();
      expect(userService.updatedLoggedUser).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Login successful" });
    });

  });

  // ================================
  // LOGOUT
  // ================================

  describe("logout", () => {

    it("should logout and clear cookies", async () => {
      req.user = { userId: "123" };

      await controller.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith("123");
      expect(res.clearCookie).toHaveBeenCalledWith("auth_token");
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
    });

  });

  // ================================
  // FORGET PASSWORD
  // ================================

  describe("forgetpass", () => {

    it("should throw if email missing", async () => {
      req.body = {};

      await expect(controller.forgetpass(req, res))
        .rejects
        .toThrow(BadRequestException);
    });

    it("should send reset email", async () => {
      const fakeUser = { id: "123", role: "user" };

      req.body = { email: "test@mail.com" };

      userService.get_user_bymail.mockResolvedValue(fakeUser as any);
      authService.persistReset.mockResolvedValue("123456");

      await controller.forgetpass(req, res);

      expect(authService.persistReset).toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail)
        .toHaveBeenCalledWith("test@mail.com", "123456");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith("sent mail");
    });

  });

  // ================================
  // UPDATE PASSWORD
  // ================================

  describe("updatePass", () => {

    it("should throw if fields missing", async () => {
      req.body = { email: "test@mail.com" };

      await expect(controller.updatePass(req, res))
        .rejects
        .toThrow(BadRequestException);
    });

    it("should throw if token invalid", async () => {
      req.body = {
        email: "test@mail.com",
        token: "111111",
        pass: "newPass"
      };

      authService.verifyResetToken.mockResolvedValue(false);

      await expect(controller.updatePass(req, res))
        .rejects
        .toThrow(BadRequestException);
    });

 it("should update password successfully", async () => {
  req.body = {
    email: "test@mail.com",
    token: "111111",
    pass: "newPass"
  };

  authService.verifyResetToken.mockResolvedValue(true);

  await controller.updatePass(req, res);

  expect(userService.updateuserpass)
    .toHaveBeenCalledWith("test@mail.com", "newPass");

  expect(authService.clearResetToken)
    .toHaveBeenCalledWith("test@mail.com");

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json)
    .toHaveBeenCalledWith({ message: "Password updated successfully" });
});

  });

});