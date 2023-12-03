// import { request } from 'umi';
import {request} from '../../config/API';

export interface NoticeListRequestParamsType {
  per_page?: number,
  page?: number
}

export interface addNoticeListRequestParamsType {
  name: string,
  description: string,
  type_id: number,
  hook_url?: string;
  hook_token?: string;
  corpid?: string;
  corpsecret?: string;
  appkey?: string;
  appsecret?: string;
}

export interface getNoticeDetailRequestParamsType {
  noticeId: number
}

export interface delNoticeDetailRequestParamsType {
  noticeId: number
}

export interface updateNoticeDetailRequestParamsType {
  noticeId: number,
  name: string
  description: string
  type_id: number,
  hook_url?: string,
  hook_token?: string,
  corpid?: string,
  corpsecret?: string,
  appkey?: string,
  appsecret?: string,
}


export async function getNoticeListRequest(params: NoticeListRequestParamsType) {
  return request<API.TicketListData>('/api/v1.0/workflows/custom_notices', {
    method: 'get',
    params: params
  });
}

export async function getSimpleNoticeListRequest(params: NoticeListRequestParamsType) {
  return request<API.TicketListData>('/api/v1.0/workflows/simple_custom_notices', {
    method: 'get',
    params: params
  });
}

export async function addNoticeListRequest(params: addNoticeListRequestParamsType) {
  return request<API.CommonResponse>('/api/v1.0/workflows/custom_notices', {
    method: 'post',
    data: params,
  })
}

export async function getNoticeDetailRequest(params: getNoticeDetailRequestParamsType) {
  return request<API.CommonResponse>(`/api/v1.0/workflows/custom_notices/${params.noticeId}`, {
    method: 'get',
  })
}

export async function delNoticeDetailRequest(params: delNoticeDetailRequestParamsType) {
  return request<API.CommonResponse>(`/api/v1.0/workflows/custom_notices/${params.noticeId}`, {
    method: 'delete',
  })
}


export async function updateNoticeDetailRequest(noticeId: number, params: updateNoticeDetailRequestParamsType) {
  console.log(`updatenoteic: ${noticeId}`);
  return request<API.CommonResponse>(`/api/v1.0/workflows/custom_notices/${noticeId}`, {
    method: 'patch',
    data: params
  })
}





// types.ts
export interface IPRangeRespondParamsType {
  code?: number,
  message?: String,
  data: IPRangeType[]
}

export interface IPRangeType {
  id: number;
  ip_group: number; // Adjust the type as per your actual data model
  first_ip: string;
  cidr_prefix_length: number | null;
  last_ip: string | null;
  description: string;
}

export interface IPRangeFormDataType {
  ip_group: number;
  first_ip: string;
  cidr_prefix_length: number | null;
  last_ip: string | null;
  description: string;
}

export interface IPTurnRespondParamsType {
  code?: number,
  message?: String,
  data: {
    id: number,
    url_patter: string,
    ip_group_id: number,
    reverse_ip_group: boolean,
    action: string,
    rank: number
  }
}


export const IPRangeService = {
  list: () =>
    request<IPRangeRespondParamsType>('/api/v1.0/ip_restricts'),

  get: (id: number) =>
    request<IPRangeType>(`/api/v1.0/ip_restricts/${id}`),

  create: (data: IPRangeFormDataType) =>
    request<IPRangeType>('/api/v1.0/ip_restricts/create', {
      method: 'POST',
      data
    }),

  update: (id: number, data: IPRangeFormDataType) =>
    request<IPRangeType>(`/api/v1.0/ip_restricts/${id}/update`, {
      method: 'PATCH',
      data
    }),

  delete: (id: number) =>
    request<void>(`/api/v1.0/ip_restricts/${id}/delete`, {
      method: 'DELETE'
    }),
    
  isTurn: () =>
    request<IPTurnRespondParamsType>(`/api/v1.0/ip_restricts/turn`),

  turnOnOff: () =>
    request<IPTurnRespondParamsType>(`/api/v1.0/ip_restricts/turn`, {
      method: 'PATCH',
    }),
  
};
