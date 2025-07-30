export const JWT_SECRET =
  process.env.JWT_SECRET || 'askldfndlsamdlksanfmvasidzxkccxvxcvad2eds';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m';

export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'askldfndlsamdlksanfmvasidzxkccxvxcvad2eds';
export const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || '30d';
