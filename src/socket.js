const app = require("./app");
const { Server: SocketIOServer } = require("socket.io");
const http = require("http");

module.exports = async (server) => {
  // const data = taxationKeyWordsModel({
  //   keywords:
  //     "taxation, income tax, corporate tax, VAT, value-added tax, sales tax, tax rate, tax brackets, tax deductions, tax credits, tax benefits,taxpayer, tax laws, tax policy, tax compliance, tax filing, tax returns, taxable income, tax audit, self-assessment, tax exemption, tax fraud, tax avoidance, tax evasion, tax planning, property tax, inheritance tax, capital gains tax, estate tax, transfer tax, gift tax, payroll tax, withholding tax, excise tax, customs duties, tax reform, tax treaties, double taxation, progressive tax, regressive tax, proportional tax, indirect tax, direct tax, taxable goods, taxable services, consumption tax, carbon tax, environmental tax, digital tax, international tax, cross-border taxation, transfer pricing, tax havens, tax shelter, social security tax, medicare tax, federal tax, state tax, local tax, sales tax exemption, property tax assessment, tax invoice, tax code, tax consultant, tax advisory, tax bracket system, tax filing deadline, taxpayer identification number, estimated tax payments, capital gains, dividend tax, interest income tax, rental income tax, business tax, sole proprietorship tax, partnership tax, LLC tax, S-Corp tax, C-Corp tax, tax withholding, tax remittance, tax receipt, tax due date, tax return preparation, taxable event, tax refund, tax offset, tax base, tax residence, tax filing status, taxable estate, tax avoidance schemes, tax advisor, tax audit procedure, tax collection, value-added tax refund, net tax liability, tax compliance requirements, corporate tax rates, tax treaty benefits, tax rate reduction, tax harmonization, tax incentives, corporate tax avoidance, tax reporting requirements, tax planning strategies, tax dispute resolution, transfer pricing rules, international taxation, taxable event, double taxation relief, inheritance tax planning, sales tax exemption certificate, charitable tax deduction, tax-free savings, nonprofit tax exemption, tax brackets and rates, tax credits for businesses, tax obligations, employer tax liabilities, tax audit procedures, filing tax returns, sales tax reporting, tax deductions for individuals, tax dispute, tax collection agency, taxpayer assistance, tax calculation, taxable property, tax reduction strategy, tax shelter schemes, tax cut policies, tax assessment notice, tax levies, taxable compensation, taxable pension income, income tax withholding, special tax regimes, investment tax, taxable distributions, tax bracket ranges, tax audit risks, tax compliance check, tax bill, tax exemption eligibility, social security withholding, sales tax permit, tax evasion penalties, tax compliance audit, tax justice, tax justice reforms, corporate tax shelters, tax advantages, tax classification, tax settlement, tax avoidance strategies, tax rules, tax regulations, tax obligations for businesses, tax filing forms, filing taxes online, tax return e-filing, tax advice, non-taxable income, tax gap, taxpayer rights, tax refunds and credits, global tax reform, sales tax calculation, taxpayer reporting requirements, anti-tax avoidance measures, international tax treaties, social welfare tax, environmental taxation, value-added tax rate, tax information exchange agreements, tax liabilities, tax incentives for investments, property tax rates, tax benefits of retirement plans, tax penalty, tax residency status, tax relief measures, taxation of pensions, taxation of dividends, taxation of capital gains, taxation of foreign income, tax credits for education, tax credit for dependents, taxable pension funds, tax rate changes, tax return deadlines, taxpayer education, tax burden, tax compliance rate, tax fraud investigations, tax relief for businesses, tax on foreign investments, tax laws and regulations, income tax rates",
  // });
  // await data.save();
  const io = new SocketIOServer(server, {
    cors: {
      origin: { origin: "*" },
      methods: ["GET", "POST"],
    }, // Restrict to trusted domain
    maxHttpBufferSize: 100 * 100 * 1024, // You can adjust this based on your needs
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    const user = socket.handshake.query.user;

    if (user) {
      socket.join(user.toString()); // Ensure that the user is valid and join them to the room
      console.log(`User ${user} connected to the server.`);
    } else {
      console.log("No user found in handshake query.");
    }

    socket.on("disconnect", () => {
      if (user) {
        socket.leave(user.toString());
      }
      console.log(`User ${user} disconnected.`);
    });
  });
};
