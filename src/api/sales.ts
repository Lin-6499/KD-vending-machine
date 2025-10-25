import axios from "@/api";

// 销售概览数据接口
export interface SalesOverview {
  todayRevenue: number;
  revenueGrowth: number;
  todayOrders: number;
  ordersGrowth: number;
  activeMachines: number;
  totalMachines: number;
  avgOrderValue: number;
}

// 销售趋势数据接口
export interface SalesTrend {
  date: string;
  sales: number;
  orders: number;
}

// 热销商品接口
export interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

// 设备销售数据接口
export interface MachineSales {
  machine: string;
  sales: number;
}

// 时段销售数据接口
export interface HourlySales {
  hour: string;
  sales: number;
}

// 商品类别数据接口
export interface CategorySales {
  category: string;
  value: number;
  sales: number;
}

// 实时销售数据接口
export interface RealtimeSales {
  id: number;
  time: string;
  machineId: string;
  productName: string;
  amount: number;
}

// 获取销售概览数据
export const getSalesOverview = (): Promise<SalesOverview> => {
  return axios({
    url: "/mock/sales/overview",
    method: "get"
  });
};

// 获取销售趋势数据
export const getSalesTrend = (days: number = 7): Promise<SalesTrend[]> => {
  return axios({
    url: "/mock/sales/trend",
    method: "get",
    params: { days }
  });
};

// 获取热销商品数据
export const getTopProducts = (limit: number = 10): Promise<TopProduct[]> => {
  return axios({
    url: "/mock/sales/top-products",
    method: "get",
    params: { limit }
  });
};

// 获取设备销售分布数据
export const getMachineSales = (): Promise<MachineSales[]> => {
  return axios({
    url: "/mock/sales/machine-distribution",
    method: "get"
  });
};

// 获取时段销售数据
export const getHourlySales = (): Promise<HourlySales[]> => {
  return axios({
    url: "/mock/sales/hourly",
    method: "get"
  });
};

// 获取商品类别销售数据
export const getCategorySales = (): Promise<CategorySales[]> => {
  return axios({
    url: "/mock/sales/category",
    method: "get"
  });
};

// 获取实时销售数据
export const getRealtimeSales = (): Promise<RealtimeSales[]> => {
  return axios({
    url: "/mock/sales/realtime",
    method: "get"
  });
};

// 连接实时销售数据
export const connectRealtimeData = (callback: (data: RealtimeSales) => void) => {
  // 模拟实时数据连接，每3秒推送一条新数据
  const interval = setInterval(() => {
    const newSale: RealtimeSales = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      machineId: `VM-${Math.floor(Math.random() * 100)
        .toString()
        .padStart(3, "0")}`,
      productName: ["可乐", "雪碧", "薯片", "巧克力", "矿泉水"][Math.floor(Math.random() * 5)],
      amount: Math.floor(Math.random() * 50) + 10
    };
    callback(newSale);
  }, 3000);

  // 返回清理函数
  return () => clearInterval(interval);
};
