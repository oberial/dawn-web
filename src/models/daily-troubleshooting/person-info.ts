export class PersonInfo {
    id!: string;
    code!: string;
    name!: string;
    // 身份证号码
    identificationNumber!: string;
    // 性别
    sex!: string;
    // phone
    phone!: string;
    // 现居住地址
    address!: string;
    // 小区
    plot!: string;
    // 楼栋
    building!: string;
    // 单元号
    unitNumber!: string;
    // 房号
    roomNo!: string;
    // 体温body temperature
    bodyTemperature!: string;
    // 过去14天是否离开过本地区
    leaveArea!: boolean;
    // 确诊情况
    confirmed_diagnosis!: string;
    // 填报时间
    createTime!: string | null;
    // 多租户
    multiTenancy!: string;
    // 年龄
    age!: number | null;
    // 体温大于37.7
    exceedTemp!: boolean;
    // 是否有接触史
    contact!: boolean;
    // 其它症状
    otherSymptoms!: string;
    // 医疗意见
    medicalOpinion!: string;
    // 备注
    note!: String;
    constructor() {
        this.id = '';
        this.code = '';
        this.name = '';
        // 身份证号码
        this.identificationNumber = '';
        // 性别
        this.sex = '';
        // phone
        this.phone = '';
        // 现居住地址
        this.address = '';
        // 小区
        this.plot = '';
        // 楼栋
        this.building = '';
        // 单元号
        this.unitNumber = '';
        // 房号
        this.roomNo = '';
        // 体温body temperature
        this.bodyTemperature = '';
        // 过去14天是否离开过本地区
        // this.leaveArea = false;
        // 确诊情况
        this.confirmed_diagnosis = '';

        this.age = null;
        // 体温大于37.7
        this.exceedTemp = false;
        // 是否有接触史
        this.contact = false;
        // 其它症状
        this.otherSymptoms =  '';
        // 医疗意见
        this.medicalOpinion =  '';
        // 备注
        this.note = '';
    }
}
