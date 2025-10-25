import { MockMethod } from "vite-plugin-mock";

// 生成随机数据的辅助函数
const generateRandomSales = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomRevenue = (min: number, max: number) => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

// 生成销售趋势数据
const generateTrendData = (period: string) => {
  const data = [];
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" }),
      sales: generateRandomSales(2000, 4000),
      orders: generateRandomSales(120, 250)
    });
  }

  return data;
};

// 生成设备销售数据
const generateMachineData = () => {
  const machines = ["VM001", "VM002", "VM003", "VM004", "VM005", "VM006", "VM007", "VM008"];
  return machines.map(machine => ({
    machine,
    sales: generateRandomSales(2000, 4000)
  }));
};

// 生成时段销售数据
const generateHourlyData = () => {
  const hours = [];
  for (let i = 0; i < 24; i += 2) {
    hours.push({
      hour: `${String(i).padStart(2, "0")}:00`,
      sales: generateRandomSales(20, 350)
    });
  }
  return hours;
};

// 生成商品类别数据
const generateCategoryData = () => {
  return [
    { category: "饮料", value: 45.2, sales: generateRandomSales(15000, 20000) },
    { category: "零食", value: 28.6, sales: generateRandomSales(8000, 12000) },
    { category: "咖啡", value: 16.8, sales: generateRandomSales(5000, 8000) },
    { category: "其他", value: 9.4, sales: generateRandomSales(3000, 5000) }
  ];
};

// 生成实时销售数据
const generateRealtimeData = () => {
  const products = ["可口可乐", "农夫山泉", "乐事薯片", "德芙巧克力", "雀巢咖啡", "康师傅绿茶", "奥利奥饼干"];
  const machines = ["VM001", "VM002", "VM003", "VM004", "VM005", "VM006", "VM007", "VM008"];

  return [
    {
      id: Date.now(),
      time: new Date().toLocaleTimeString("zh-CN"),
      machineId: machines[Math.floor(Math.random() * machines.length)],
      productName: products[Math.floor(Math.random() * products.length)],
      amount: parseFloat(generateRandomRevenue(2, 20))
    }
  ];
};

export default [
  // 获取销售概览数据
  {
    url: "/mock/sales/overview",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "success",
        data: {
          todayRevenue: parseFloat(generateRandomRevenue(20000, 30000)),
          revenueGrowth: parseFloat((Math.random() * 20 - 5).toFixed(1)),
          todayOrders: generateRandomSales(1000, 1500),
          ordersGrowth: parseFloat((Math.random() * 15 - 2).toFixed(1)),
          activeMachines: generateRandomSales(40, 50),
          totalMachines: 50,
          avgOrderValue: parseFloat(generateRandomRevenue(15, 25))
        }
      };
    }
  },

  // 获取销售趋势数据
  {
    url: "/mock/sales/trend",
    method: "get",
    response: ({ query }: any) => {
      const days = parseInt(query.days) || 7;
      return {
        code: 200,
        message: "success",
        data: generateTrendData(days + "d")
      };
    }
  },

  // 获取热销商品数据
  {
    url: "/mock/sales/top-products",
    method: "get",
    response: ({ query }: any) => {
      const limit = parseInt(query.limit) || 10;
      const products = [
        "可口可乐 330ml",
        "农夫山泉 550ml",
        "乐事薯片 70g",
        "德芙巧克力 43g",
        "雀巢咖啡 180ml",
        "康师傅绿茶 500ml",
        "奥利奥饼干 58g",
        "红牛能量饮料 250ml",
        "旺旺雪饼 84g",
        "统一冰红茶 500ml",
        "百事可乐 330ml",
        "怡宝纯净水 550ml"
      ];

      const data = products.slice(0, limit).map((name, index) => ({
        id: index + 1,
        name,
        sales: generateRandomSales(50, 300),
        revenue: parseFloat(generateRandomRevenue(200, 2000))
      }));

      // 按销量排序
      data.sort((a, b) => b.sales - a.sales);

      return {
        code: 200,
        message: "success",
        data
      };
    }
  },

  // 获取设备销售分布数据
  {
    url: "/mock/sales/machine-distribution",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "success",
        data: generateMachineData()
      };
    }
  },

  // 获取时段销售数据
  {
    url: "/mock/sales/hourly",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "success",
        data: generateHourlyData()
      };
    }
  },

  // 获取商品类别销售数据
  {
    url: "/mock/sales/category",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "success",
        data: generateCategoryData()
      };
    }
  },

  // 获取实时销售数据
  {
    url: "/mock/sales/realtime",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "success",
        data: generateRealtimeData()
      };
    }
  }
] as MockMethod[];
