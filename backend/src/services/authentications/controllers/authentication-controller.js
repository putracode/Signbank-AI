import AuthenticationRepository from "../repositories/authentication-repository.js";
import AuthenticationError from "../../../exceptions/authentication-error.js";
import TokenManager from "../../../security/token-manager.js";
import UserRepository from "../../users/repositories/user-repository.js";
import InvariantError from "../../../exceptions/invariant-error.js";
import response from "../../../utils/response.js";

export const login = async (req, res, next) => {
  const { email, password } = req.validated;

  const userId = await UserRepository.verifyCredentials(email, password);

  if (!userId) {
    return next(new AuthenticationError("Kredensial yang anda berikan salah"));
  }

  const accessToken = TokenManager.generateAccessToken({ id: userId });
  const refreshToken = TokenManager.generateRefreshToken({ id: userId });

  await AuthenticationRepository.createToken(refreshToken);

  return response(res, 200, "Login berhasil", {
    accessToken,
    refreshToken,
  });
};

export const refresh = async (req, res, next) => {
  const { refreshToken } = req.validated;

  const result = await AuthenticationRepository.verifyToken(refreshToken);

  if (!result) {
    return next(new InvariantError("Refresh token tidak valid"));
  }

  const { id } = TokenManager.verifyRefreshToken(refreshToken);
  const accessToken = TokenManager.generateAccessToken({ id });

  return response(res, 200, "Access Token berhasil diperbarui", { accessToken });
};

export const logout = async (req, res, next) => {
  const { refreshToken } = req.validated;

  const result = await AuthenticationRepository.verifyToken(refreshToken);

  if (!result) {
    return next(new InvariantError("Refresh token tidak valid"));
  }

  await AuthenticationRepository.deleteToken(refreshToken);

  return response(res, 200, "Refresh token berhasil dihapus");
};
