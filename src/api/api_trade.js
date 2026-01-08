import request from './request';

export const addTrade = (data) => {
  return request.post('/trades', data);
};