import DailyTroubleshootingService from '@/api/daily-troubleshooting/daily-troubleshooting';
import transformToColor from '@/common/filters/colorformat';
import DailyQueryConditions from '@/models/common/daily-query-conditions';
import { ModelType } from '@/models/daily-troubleshooting/model-type';

const dailyTroubleshooting = {
  state: {
    statisticsData: [],
    totalCount: 0,
    personData: [],
    isShowgGroup: false,
    conditions: new DailyQueryConditions(),
    groupsOriginalData: [],
    groupsData: [],
    groupPersonData: [],
    activeName: '',
    groupPersonTotalCount: 0,
    checkedTotalCount: 0,
    unCheckedTotalCount: 0,
    modelType: ModelType.checked,
    formStatus: false,
  },
  mutations: {
    SET_STATISTICS_DATA: (state: any, result: any) => {
      if (result && Array.isArray(result)) {
        result.forEach(e => {
          e.name = e.dSourceDataModel.name;
          e.id = e.dSourceDataModel.id;
          e.selected = false;
          e.strokeStyle = e.dSourceDataModel.imgColor ? e.dSourceDataModel.imgColor : transformToColor(e.dSourceDataModel.name);
          e.value = e.count;
        });
        state.statisticsData = result;
      }
    },
    SET_PERSON_DATA: (state: any, result: any) => {
      if (result) {
        state.totalCount = result.count;
        state.personData = result.value;
      }
    },
    LOAD_PERSON_DATA: (state: any, result: any) => {
      if (result) {
        state.totalCount = result.count;
        state.personData = result.value;
      }
    },
    SET_IS_SHOW_GROUP: (state: any, result: any) => {
      state.isShowgGroup = result;
    },
    SET_CONDITIONS: (state: any, conditions: DailyQueryConditions) => {
      // state.conditions.page = 1;
      Object.assign(state.conditions, conditions);
    },
    SET_GROUPS_DATA: (state: any, result: any) => {
      console.log('---SET_GROUPS_DATA---');
      if (result && Array.isArray(result)) {
        state.checkedTotalCount = result.reduce((prev: any, cur: any) => {
          return Number(cur.checked) + Number(prev);
        }, 0);
        state.unCheckedTotalCount = result.reduce((prev: any, cur: any) => {
          return Number(cur.unchecked) + Number(prev);
        }, 0);
      }
      state.groupsData = result;
    },
    SET_GROUP_PERSON_DATA: (state: any, result: any) => {
      state.groupPersonTotalCount = result.count;
      state.groupPersonData = result.value;
    },
    SET_ACTIVE_NAME: (state: any, result: any) => {
      state.activeName = result;
    },
    SET_MODEL_TYPE: (state: any, result: any) => {
      state.conditions.page = 0;
      state.modelType = result;
    },
    RESET_DATA: (state: any) => {
      state.statisticsData = [];
      state.totalCount = 0;
      state.personData = [];
      // state.isShowgGroup = false;
      state.conditions = new DailyQueryConditions();
      state.groupsOriginalData = [];
      state.groupsData = [];
      state.groupPersonData = [];
      state.activeName = '';
      state.groupPersonTotalCount = 0;
      state.checkedTotalCount = 0;
      state.unCheckedTotalCount = 0;
    },
    SET_CHECK_GROUP_INFO: (state: any, result: any) => {
      state.conditions.checkedPlot = result.checkedPlot;
      state.conditions.checkedBuilding = result.checkedBuilding;
      state.conditions.checkedUnitNumber = result.checkedUnitNumber;
    },
    SET_CONDITIONS_IS_CHECKED: (state: any, result: any) => {
      state.conditions.isChecked = result;
    },
    SET_DAILY_TROUBLE_SHOOTING_FORM_STATUS: (state: any, result: any) => {
      state.formStatus = result;
    }
  },
  actions: {
    async SetStatisticsData({ commit }: any) {
      const result = await DailyTroubleshootingService.getStatisticsData();
      commit('SET_STATISTICS_DATA', result);
    },
    async SetPersonData({ commit }: any, payloads: any) {
      const result = await DailyTroubleshootingService.queryAllDailyRecord(payloads.page, payloads.count);
      commit('SET_PERSON_DATA', result);
    },
    async LoadPersonData({ commit, state }: any) {
      const result = await DailyTroubleshootingService.loadAllDailyRecord(state.conditions);
      commit('LOAD_PERSON_DATA', result);
    },
    SetIsShowGroup({ dispatch, commit, state }: any, payloads: any) {
      state.conditions.page = 0;
      // 设置是否为组查看
      state.conditions.isGroup = payloads;
      // 清楚关键字
      state.conditions.keyWord = '';
      if (payloads) {
        state.conditions.isFaver = [];
        state.conditions.medicalOpinion = [];
        dispatch('SetGroupsData');
      } else {
        state.modelType = ModelType.checked;
        state.activeName = '';
        state.groupPersonData = [];
        dispatch('LoadPersonData');
      }
      dispatch('SetStatisticsData');
      commit('SET_IS_SHOW_GROUP', payloads);
    },
    SetConditions: async ({ dispatch, commit, state }: any, conditions: DailyQueryConditions) => {
      commit('SET_CONDITIONS', conditions);
      if (state.isShowgGroup) {
        // if (state.conditions.dailyStatisticModel) {
        //   dispatch('SetGroupPersonData');
        // } else {
        // }
        dispatch('SetGroupsData');
      } else {
        dispatch('LoadPersonData');
      }
    },
    SetGroupsData: async ({ dispatch, commit, state }: any) => {
      if (state.conditions && state.conditions.plots && state.conditions.plots.length > 0) {
        const result = state.groupsOriginalData.filter((e: any) => state.conditions.plots.includes(e.plotId));
        commit('SET_GROUPS_DATA', result);
      } else {
        const result = await DailyTroubleshootingService.queryGroupsData();
        state.groupsOriginalData = result;
        commit('SET_GROUPS_DATA', result);
      }
    },
    SetGroupPersonData: async ({ dispatch, commit, state }: any, conditions?: DailyQueryConditions) => {
      Object.assign(state.conditions, conditions);
      if (state.conditions.dailyStatisticModel) {
        if (state.modelType === ModelType.checked) {
          const result = await DailyTroubleshootingService.getGroupPersonData(state.conditions);
          commit('SET_GROUP_PERSON_DATA', result);
        } else {
            const con = {
              building: state.conditions.dailyStatisticModel.building,
              page: state.conditions.page,
              pageSize: state.conditions.pageSize,
              plot: state.conditions.dailyStatisticModel.plotId,
              unitNumber: state.conditions.dailyStatisticModel.unitNumber
            };
            const result = await DailyTroubleshootingService.queryUncheckedData(con);
            const data = {
              count: result.total,
              value: result.dailyTroubleshootRecordModels
            };
            commit('SET_GROUP_PERSON_DATA', data);
        }
      }
    },
    SetUncheckedData: async ({ dispatch, commit, state }: any, conditions: any) => {
      const con = {
        building: state.conditions.dailyStatisticModel.building,
        page: state.conditions.page,
        pageSize: state.conditions.pageSize,
        plot: state.conditions.dailyStatisticModel.plotId,
        unitNumber: state.conditions.dailyStatisticModel.unitNumber
      };
      const result = await DailyTroubleshootingService.queryUncheckedData(con);

      state.groupPersonTotalCount = result.total;
      state.groupPersonData = result.dailyTroubleshootRecordModels;
      // commit('SET_GROUP_PERSON_DATA', result);
    },
    SetActiveName: async ({ dispatch, commit, state }: any, payloads: any) => {
      console.log('---SetActiveName---');
      commit('SET_ACTIVE_NAME', payloads);
      state.conditions.page = 0;
      if (typeof payloads === 'number') {
        state.conditions.dailyStatisticModel = state.groupsData[payloads];
        dispatch('SetGroupPersonData');
      } else {
        state.groupPersonData = [];
        state.groupPersonTotalCount = 0;
      }
    },
    SetModelType: async ({ dispatch, commit, state }: any, type: any) => {
      commit('SET_MODEL_TYPE', type);
      dispatch('SetGroupPersonData');
    },
    ResetData: ({ commit }: any) => {
      commit('RESET_DATA');
    }
  },
  getters: {
    dailyTroubleshooting_statisticsData: (state: any) => state.statisticsData,
    dailyTroubleshooting_totalCount: (state: any) => state.totalCount,
    dailyTroubleshooting_personData: (state: any) => state.personData,
    dailyTroubleshooting_isShowgGroup: (state: any) => state.isShowgGroup,
    dailyTroubleshooting_groupsData: (state: any) => state.groupsData,
    dailyTroubleshooting_groupPersonData: (state: any) => state.groupPersonData,
    dailyTroubleshooting_conditions: (state: any) => state.conditions,
    dailyTroubleshooting_groupPersonTotalCount: (state: any) => state.groupPersonTotalCount,
    dailyTroubleshooting_checkedTotalCount: (state: any) => state.checkedTotalCount,
    dailyTroubleshooting_unCheckedTotalCount: (state: any) => state.unCheckedTotalCount,
    dailyTroubleshooting_formStatus: (state: any) => state.formStatus,
    dailyTroubleshooting_modelType: (state: any) => state.modelType,
  }
};

export default dailyTroubleshooting;
