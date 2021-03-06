import { DailyQueryConditions } from '@/models/common/daily-query-conditions';
import * as httpClient from '@gsafety/vue-httpclient/dist/httpclient';
import store from '@/store';
import odataClient from '@gsafety/odata-client/dist';

import { PersonInfo } from '@/models/daily-troubleshooting/person-info';
import { PersonOdataInfo } from '@/models/daily-troubleshooting/person-odata-info';
import { eqBy, cond } from 'ramda';
import moment from 'moment';
export default {
    // 新增填报记录
    addDailyTroubleshooting(info: PersonInfo) {
        const url = store.getters.configs.baseSupportUrl + 'daily-troubleshoot-record';
        return httpClient
        .postPromise(url, info)
        .then(res => {
            return res;
        })
        .catch(err => {
            return false;
        });
    },
    // 修改填报记录
    editDailyTroubleshooting(info: PersonInfo) {
      const url = store.getters.configs.baseSupportUrl + 'daily-troubleshoot-record';
        return httpClient
        .putPromise(url, info)
        .then(res => {
            return res;
        })
        .catch(err => {
            return false;
        });
    },
    // 通过导入新增文件
    addDailyTroubleshootingByxlsx(info: any) {
      const url = store.getters.configs.baseSupportUrl + 'daily-troubleshoot-record/import';
        return httpClient
        .postPromise(url, info, {headers: {'Content-Type': 'multipart/form-data'}})
        .then(res => {
            return res;
        })
        .catch(err => {
            return false;
        });
    },
    // 查询所有日常排查记录
    queryAllDailyRecord(page: number, count: number, keyowrds?: string, ids?: string[]) {
      const q = odataClient({
        service: store.getters.configs.communityManagerOdataUrl,
        resources: 'DailyTroubleshootRecordEntity'
      });
      let filterStr = '';
      if (keyowrds) {
        filterStr += 'contains( name, \'' + keyowrds + '\') or contains( address, \'' + keyowrds + '\') or contains( phone, \'' + keyowrds + '\')';

        const keywordList = keyowrds.split('-');
        let building = '';
        let unitNumber = '';
        let roomNo = '';
        let bstr = '';
        if ( keywordList.length > 0 ) {
          building =  keywordList[0];
          bstr += 'contains( building, \'' + building + '\')';
        }
        if ( keywordList.length > 1 ) {
          unitNumber =  keywordList[1];
          bstr += ' and contains( unitNumber, \'' + unitNumber + '\')';
        }
        if ( keywordList.length > 2 ) {
          roomNo =  keywordList[2];
          bstr += ' and contains( roomNo, \'' + roomNo + '\')';
        }
        if (bstr) {
          filterStr = '(' + filterStr + ' or ' + bstr + ')';
        }
      }
      if (ids && ids.length > 0) {
        let str = '';
        for (let i = 0, len = ids.length - 1; i < ids.length; i++) {
            const id = ids[i];
            if (i !== len) {
                str += '(plot eq \'' + id + '\') or ';
            } else {
                str = '(' + str + '(plot eq \'' + id + '\')' + ')';
                if (filterStr) {
                  filterStr = filterStr + ' and ' + str;
                } else {
                  filterStr += str;
                }
            }
        }
      }
      const startTime = moment().startOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      const endTime = moment().endOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      if (filterStr) {
        filterStr = '(createTime gt ' + startTime + ') and '
                  + '(createTime lt ' + endTime + ') and ' + filterStr;
      } else {
        filterStr = '(createTime gt ' + startTime + ') and '
                  + '(createTime lt ' + endTime + ')';
      }
      if (filterStr) {
        return q
          .skip(count * (page))
          .top(count)
          .filter(filterStr)
          .orderby('building', 'asc')
          .orderby('unitNumber', 'asc')
          .orderby('roomNo', 'asc')
          .orderby('createTime', 'asc')
          .count(true)
          .get(null)
          .then((response: any) => {
            const result = {
              count: JSON.parse(response.body)['@odata.count'],
              value: this.buildDailyRecord(JSON.parse(response.toJSON().body).value)
            };
            return result;
          })
          .catch((error: any) => {});
      } else {
        return q
          .skip(count * (page))
          .top(count)
          .orderby('building', 'asc')
          .orderby('unitNumber', 'asc')
          .orderby('roomNo', 'asc')
          .orderby('createTime', 'asc')
          .count(true)
          .get(null)
          .then((response: any) => {
            const result = {
              count: JSON.parse(response.body)['@odata.count'],
              value: this.buildDailyRecord(JSON.parse(response.toJSON().body).value)
            };
            return result;
          })
          .catch((error: any) => {});
      }
    },


    // 查询所有日常排查记录
    loadAllDailyRecord(conditions: DailyQueryConditions) {
      const q = odataClient({
        service: store.getters.configs.communityManagerOdataUrl,
        resources: 'DailyTroubleshootRecordEntity'
      });
      let filterStr = '';
      if (conditions.keyWord) {
        filterStr += 'contains( name, \'' + conditions.keyWord + '\') or contains( address, \'' + conditions.keyWord + '\') or contains( phone, \'' + conditions.keyWord + '\')';
        const keywordList = conditions.keyWord.split('-');
        let building = '';
        let unitNumber = '';
        let roomNo = '';
        let bstr = '';
        if ( keywordList.length > 0 ) {
          building =  keywordList[0];
          bstr += 'contains( building, \'' + building + '\')';
        }
        if ( keywordList.length > 1 ) {
          unitNumber =  keywordList[1];
          bstr += ' and contains( unitNumber, \'' + unitNumber + '\')';
        }
        if ( keywordList.length > 2 ) {
          roomNo =  keywordList[2];
          bstr += ' and contains( roomNo, \'' + roomNo + '\')';
        }
        if (bstr) {
          filterStr = '(' + filterStr + ' or ' + bstr + ')';
        }
      }
      if (conditions.plots && conditions.plots.length > 0) {
        let str = '';
        for (let i = 0, len = conditions.plots.length - 1; i < conditions.plots.length; i++) {
            const id = conditions.plots[i];
            if (i !== len) {
                str += '(plot eq \'' + id + '\') or ';
            } else {
                str = '(' + str + '(plot eq \'' + id + '\')' + ')';
                if (filterStr) {
                  filterStr = filterStr + ' and ' + str;
                } else {
                  filterStr += str;
                }
            }
        }
      }

      if (conditions.medicalOpinion && conditions.medicalOpinion.length > 0) {
        let str = '';
        for (let i = 0, len = conditions.medicalOpinion.length - 1; i < conditions.medicalOpinion.length; i++) {
            const id = conditions.medicalOpinion[i];
            if (i !== len) {
                str += '(medicalOpinion eq \'' + id + '\') or ';
            } else {
                str = '(' + str + '(medicalOpinion eq \'' + id + '\')' + ')';
                if (filterStr) {
                  filterStr = filterStr + ' and ' + str;
                } else {
                  filterStr += str;
                }
            }
        }
      }

      if (conditions.isFaver && conditions.isFaver.length > 0) {
        let str = '';
        for (let i = 0, len = conditions.isFaver.length - 1; i < conditions.isFaver.length; i++) {
            const value = conditions.isFaver[i];
            if (i !== len) {
                str += '(isExceedTemp eq ' + value + ') or ';
            } else {
                str = '(' + str + '(isExceedTemp eq ' + value + ')' + ')';
                if (filterStr) {
                  filterStr = filterStr + ' and ' + str;
                } else {
                  filterStr += str;
                }
            }
        }
      }
      const startTime = moment().startOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      const endTime = moment().endOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      if (filterStr) {
        filterStr = '(createTime gt ' + startTime + ') and '
                  + '(createTime lt ' + endTime + ') and ' + filterStr;
      } else {
        filterStr = '(createTime gt ' + startTime + ') and '
                  + '(createTime lt ' + endTime + ')';
      }
      if (filterStr) {
        return q
          .skip(conditions.pageSize * (conditions.page))
          .top(conditions.pageSize)
          .filter(filterStr)
          .orderby('building', 'asc')
          .orderby('unitNumber', 'asc')
          .orderby('roomNo', 'asc')
          .orderby('createTime', 'asc')
          .count(true)
          .get(null)
          .then((response: any) => {
            const result = {
              count: JSON.parse(response.body)['@odata.count'],
              value: this.buildDailyRecord(JSON.parse(response.toJSON().body).value)
            };
            return result;
          })
          .catch((error: any) => {});
      } else {
        return q
          .skip(conditions.pageSize * (conditions.page))
          .top(conditions.pageSize)
          .orderby('building', 'asc')
          .orderby('unitNumber', 'asc')
          .orderby('roomNo', 'asc')
          .orderby('createTime', 'asc')
          .count(true)
          .get(null)
          .then((response: any) => {
            const result = {
              count: JSON.parse(response.body)['@odata.count'],
              value: this.buildDailyRecord(JSON.parse(response.toJSON().body).value)
            };
            return result;
          })
          .catch((error: any) => {});
      }
    },

    queryExportExcel(keyowrds?: string, plots?: string[]) {
      const q = odataClient({
        service: store.getters.configs.communityManagerOdataUrl,
        resources: 'DailyTroubleshootRecordEntity'
      });
      let filterStr = '';
      if (keyowrds) {
        filterStr += 'contains( name, \'' + keyowrds + '\') or contains( address, \'' + keyowrds + '\') or contains( phone, \'' + keyowrds + '\')';
        const keywordList = keyowrds.split('-');
        let building = '';
        let unitNumber = '';
        let roomNo = '';
        let bstr = '';
        if ( keywordList.length > 0 ) {
          building =  keywordList[0];
          bstr += 'contains( building, \'' + building + '\')';
        }
        if ( keywordList.length > 1 ) {
          unitNumber =  keywordList[1];
          bstr += ' and contains( unitNumber, \'' + unitNumber + '\')';
        }
        if ( keywordList.length > 2 ) {
          roomNo =  keywordList[2];
          bstr += ' and contains( roomNo, \'' + roomNo + '\')';
        }
        if (bstr) {
          filterStr = '(' + filterStr + ' or ' + bstr + ')';
        }
      }
      if (plots && plots.length > 0) {
        let str = '';
        for (let i = 0, len = plots.length - 1; i < plots.length; i++) {
            const id = plots[i];
            if (i !== len) {
                str += '(plot eq \'' + id + '\') or ';
            } else {
                str = '(' + str + '(plot eq \'' + id + '\')' + ')';
                if (filterStr) {
                  filterStr = filterStr + ' and ' + str;
                } else {
                  filterStr += str;
                }
            }
        }
      }
      const startTime = moment().startOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      const endTime = moment().endOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      if (filterStr) {
        filterStr = '(createTime gt ' + startTime + ') and '
                  + '(createTime lt ' + endTime + ') and ' + filterStr;
      } else {
        filterStr = '(createTime gt ' + startTime + ') and '
                  + '(createTime lt ' + endTime + ')';
      }
      return q
        .skip(0)
        // .top(10000)
        .orderby('building', 'asc')
        .orderby('unitNumber', 'asc')
        .orderby('roomNo', 'asc')
        .orderby('createTime', 'asc')
        .filter(filterStr)
        .count(true)
        .get(null)
        .then((response: any) => {
          const result = {
            count: JSON.parse(response.body)['@odata.count'],
            value: this.buildDailyRecord(JSON.parse(response.toJSON().body).value)
          };
          return result;
        })
        .catch((error: any) => {});
    },

    // 查询所有日常排查记录
    loadExportExcel(conditions: DailyQueryConditions) {
      const q = odataClient({
        service: store.getters.configs.communityManagerOdataUrl,
        resources: 'DailyTroubleshootRecordEntity'
      });
      let filterStr = '';
      if (conditions.keyWord) {
        filterStr += 'contains( name, \'' + conditions.keyWord + '\') or contains( address, \'' + conditions.keyWord + '\') or contains( phone, \'' + conditions.keyWord + '\')';
        const keywordList = conditions.keyWord.split('-');
        let building = '';
        let unitNumber = '';
        let roomNo = '';
        let bstr = '';
        if ( keywordList.length > 0 ) {
          building =  keywordList[0];
          bstr += 'contains( building, \'' + building + '\')';
        }
        if ( keywordList.length > 1 ) {
          unitNumber =  keywordList[1];
          bstr += ' and contains( unitNumber, \'' + unitNumber + '\')';
        }
        if ( keywordList.length > 2 ) {
          roomNo =  keywordList[2];
          bstr += ' and contains( roomNo, \'' + roomNo + '\')';
        }
        if (bstr) {
          filterStr = '(' + filterStr + ' or ' + bstr + ')';
        }
      }
      if (conditions.plots && conditions.plots.length > 0) {
        let str = '';
        for (let i = 0, len = conditions.plots.length - 1; i < conditions.plots.length; i++) {
            const id = conditions.plots[i];
            if (i !== len) {
                str += '(plot eq \'' + id + '\') or ';
            } else {
                str = '(' + str + '(plot eq \'' + id + '\')' + ')';
                if (filterStr) {
                  filterStr = filterStr + ' and ' + str;
                } else {
                  filterStr += str;
                }
            }
        }
      }

      if (conditions.medicalOpinion && conditions.medicalOpinion.length > 0) {
        let str = '';
        for (let i = 0, len = conditions.medicalOpinion.length - 1; i < conditions.medicalOpinion.length; i++) {
            const id = conditions.medicalOpinion[i];
            if (i !== len) {
                str += '(medicalOpinion eq \'' + id + '\') or ';
            } else {
                str = '(' + str + '(medicalOpinion eq \'' + id + '\')' + ')';
                if (filterStr) {
                  filterStr = filterStr + ' and ' + str;
                } else {
                  filterStr += str;
                }
            }
        }
      }

      if (conditions.isFaver && conditions.isFaver.length > 0) {
        let str = '';
        for (let i = 0, len = conditions.isFaver.length - 1; i < conditions.isFaver.length; i++) {
            const value = conditions.isFaver[i];
            if (i !== len) {
                str += '(isExceedTemp eq ' + value + ') or ';
            } else {
                str = '(' + str + '(isExceedTemp eq ' + value + ')' + ')';
                if (filterStr) {
                  filterStr = filterStr + ' and ' + str;
                } else {
                  filterStr += str;
                }
            }
        }
      }
      // 分组  isShowgGroup
      if ( conditions.isGroup ) {
        // 打开组选框, 通过分组筛选 根据小区, 楼栋, 单元 的字段来筛选
          if ( conditions.checkedPlot ) {
              const buildingStr = '( plot eq \'' + conditions.checkedPlot + '\')  ';
              if ( filterStr ) {
                filterStr = filterStr + ' and ' + buildingStr;
              } else {
                filterStr += buildingStr;
              }
          }
          if ( conditions.checkedBuilding ) {
            // 待改 (plot eq \'' + id + '\')
            const buildingStr = '( building eq \'' + conditions.checkedBuilding + '\')';
            if ( filterStr ) {
              filterStr = filterStr + ' and ' + buildingStr;
            } else {
              filterStr += buildingStr;
            }
          }
          if ( conditions.checkedUnitNumber ) {
            const unitNumberStr = '( unitNumber eq \'' + conditions.checkedUnitNumber + '\')';
            if ( filterStr ) {
              filterStr = filterStr + ' and ' + unitNumberStr;
            } else {
              filterStr += unitNumberStr;
            }
          }
      }
      // 不分组  isShowgGroup  查询所有 不加条件

      // 不排查  ???

      // 排查
      if ( conditions.isChecked ) {
        const startTime = moment().startOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
        const endTime = moment().endOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
        const str = '(createTime gt ' + startTime + ') and ' + '(createTime lt ' + endTime + ')';
        if ( filterStr ) {
          filterStr = filterStr + ' and ' + str;
        } else {
          filterStr += str;
        }
      }

      // const startTime = moment().startOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      // const endTime = moment().endOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      // if (filterStr) {
      //   filterStr = '(createTime gt ' + startTime + ') and '
      //             + '(createTime lt ' + endTime + ') and ' + filterStr;
      // } else {
      //   filterStr = '(createTime gt ' + startTime + ') and '
      //             + '(createTime lt ' + endTime + ')';
      // }
      if (filterStr) {
        return q
          .skip(0)
          // .top(10000)
          .filter(filterStr)
          .orderby('building', 'asc')
          .orderby('unitNumber', 'asc')
          .orderby('roomNo', 'asc')
          .orderby('createTime', 'asc')
          .count(true)
          .get(null)
          .then((response: any) => {
            const result = {
              count: JSON.parse(response.body)['@odata.count'],
              value: this.buildDailyRecord(JSON.parse(response.toJSON().body).value)
            };
            return result;
          })
          .catch((error: any) => {});
      } else {
        return q
          .skip(0)
          .orderby('building', 'asc')
          .orderby('unitNumber', 'asc')
          .orderby('roomNo', 'asc')
          .orderby('createTime', 'esc')
          .count(true)
          .get(null)
          .then((response: any) => {
            const result = {
              count: JSON.parse(response.body)['@odata.count'],
              value: this.buildDailyRecord(JSON.parse(response.toJSON().body).value)
            };
            return result;
          })
          .catch((error: any) => {});
      }
    },

    buildDailyRecord(result: any[]) {
      const res: any[] = [];
      if (Array.isArray(result) && result.length > 0) {
        result.forEach((data: PersonOdataInfo) => {
          const item = new PersonInfo();
          item.id = data.id;
          item.name = data.name;
          item.address = data.address;
          item.age = data.age;
          item.building = data.building;
          item.code = data.code;
          item.confirmed_diagnosis = data.confirmed_diagnosis;
          item.createTime = data.createTime;
          item.identificationNumber = data.identificationNumber;
          item.contact = data.isContact;
          item.exceedTemp = data.isExceedTemp;
          // item.leaveArea = data.isLeaveArea;
          item.medicalOpinion = data.medicalOpinion;
          item.multiTenancy = data.multiTenancy;
          item.note = data.note;
          item.otherSymptoms = data.otherSymptoms;
          item.phone = data.phone;
          item.plot = data.plot;
          item.roomNo = data.roomNo;
          item.sex = data.sex;
          item.unitNumber = data.unitNumber;
          res.push(item);
        });
      }
      return res;
    },

  queryAttachments(businessId: any): Promise<any> {
    const q = odataClient({
      service: store.getters.configs.odataUrl,
      resources: 'AttachmentEntity'
    });
    return q
      .filter('businessId', '=', businessId)
      .get()
      .then((response: any) => {
        return JSON.parse(response.body).value;
      })
      .catch((err: any) => {
        return false;
      });
  },
  queryCommunity() {
    const id = store.getters.configs.communityDataSourceId;
    const q = odataClient({
      service: store.getters.configs.communityManagerOdataUrl,
      resources: 'DataSourceEntity',
      format: 'json'
      });
    return q
      .filter('id', 'eq', id)
      .get()
      .then((response: any) => {
        return JSON.parse(response.body).value;
      })
      .catch((err: any) => {
        return false;
      });
  },

  removeRelation(fileId: any) {
    const url = store.getters.configs.planPreparationUrl + 'attachments/' + fileId;
    return httpClient
      .deletePromise(url)
      .then(res => {
        return res;
      })
      .catch(err => {
        return false;
      });
  },

  getStatisticsData() {
    const url = store.getters.configs.communityManagerUrl + 'daily-troubleshoot-record/statistics';
    return httpClient
      .getPromise(url)
      .then(res => {
        return res;
      })
      .catch(err => {
        return false;
      });
  },

  /**
   * 获取人员分组数据
   */
  queryGroupsData() {
    const url = store.getters.configs.communityManagerUrl + 'daily-troubleshoot-record/multi-criteria-query';
    return httpClient
      .postPromise(url)
      .then(res => {
        return res;
      })
      .catch(err => {
        return false;
      });
  },

   /**
   * 获取人员分组数据
   */
  queryGroupPersonData(conditions: DailyQueryConditions) {
    const url = store.getters.configs.communityManagerUrl + 'daily-troubleshoot-record/group-condition';
    return httpClient
      .postPromise(url, conditions)
      .then(res => {
        return res;
      })
      .catch(err => {
        return false;
      });
  },

   /**
   * 获取人员分组数据
   */
  getGroupPersonData(conditions: DailyQueryConditions) {
    console.log(conditions);
    const q = odataClient({
      service: store.getters.configs.communityManagerOdataUrl,
      resources: 'DailyTroubleshootRecordEntity'
    });
    let filterStr = '';
    if (conditions.plots && conditions.plots.length > 0) {
      let str = '';
      for (let i = 0, len = conditions.plots.length - 1; i < conditions.plots.length; i++) {
          const id = conditions.plots[i];
          if (i !== len) {
              str += '(plot eq \'' + id + '\') or ';
          } else {
              str = '(' + str + '(plot eq \'' + id + '\')' + ')';
              if (filterStr) {
                filterStr = filterStr + ' and ' + str;
              } else {
                filterStr += str;
              }
          }
      }
    }
    if (filterStr) {
      filterStr = '(plot eq \'' + conditions.dailyStatisticModel.plotId + '\') and ' +
      '(building eq \'' + conditions.dailyStatisticModel.building + '\') and ' +
      '(unitNumber eq \'' + conditions.dailyStatisticModel.unitNumber + '\') and ' + filterStr;
    } else {
      filterStr = '(plot eq \'' + conditions.dailyStatisticModel.plotId + '\') and ' +
      '(building eq \'' + conditions.dailyStatisticModel.building + '\') and ' +
      '(unitNumber eq \'' + conditions.dailyStatisticModel.unitNumber + '\')';
    }
    const startTime = moment().startOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    const endTime = moment().endOf('day').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    if (filterStr) {
      filterStr = '(createTime gt ' + startTime + ') and '
                + '(createTime lt ' + endTime + ') and ' + filterStr;
    } else {
      filterStr = '(createTime gt ' + startTime + ') and '
                + '(createTime lt ' + endTime + ')';
    }
    return q
      .skip(conditions.pageSize * (conditions.page))
      .top(conditions.pageSize)
      .filter(filterStr)
      .orderby('building', 'asc')
      .orderby('unitNumber', 'asc')
      .orderby('roomNo', 'asc')
      .orderby('createTime', 'asc')
      .count(true)
      .get(null)
      .then((response: any) => {
        const result = {
          count: JSON.parse(response.body)['@odata.count'],
          value: this.buildDailyRecord(JSON.parse(response.toJSON().body).value)
        };
        return result;
      })
      .catch((error: any) => {});
  },

  queryUncheckedData(param: any) {
    const url = store.getters.configs.communityManagerUrl + 'daily-troubleshoot-record/un-checked';
    return httpClient
      .postPromise(url, param)
      .then(res => {
        return res;
      })
      .catch(err => {
        return false;
      });
  },

  pullNewData() {
    const communityId = store.getters.configs.communityDataSourceId;
    const url = store.getters.configs.communityManagerUrl + `timer/${communityId}`;
    return httpClient
      .getPromise(url)
      .then(res => {
        return res;
      })
      .catch(err => {
        return false;
      });
  }

};
