import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig } from './config.js';
import {
  getBanks,
  getBank,
  getCurrencies,
  getCurrency,
  getCountries,
  getCountry,
  getPaymentMethods,
  getPaymentMethod,
  getDepositMethods,
  getDepositMethod,
  getExchangers,
  getExchanger,
  getOrganizations,
  getOrganization,
  getMerchantIndustries,
  getMerchantIndustry
} from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }

  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 50);
  });

  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));

  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });

  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('openfintech')
  .description(chalk.bold('OpenFinTech CLI') + ' - FinTech industry data from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--base-url <url>', 'API base URL (default: https://api.openfintech.io/v1)')
  .action((options) => {
    if (options.baseUrl) {
      setConfig('baseUrl', options.baseUrl);
      printSuccess('Base URL set');
    } else {
      printError('No options provided. Use --base-url');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const baseUrl = getConfig('baseUrl') || 'https://api.openfintech.io/v1 (default)';
    console.log(chalk.bold('\nOpenFinTech CLI Configuration\n'));
    console.log('Base URL: ', chalk.cyan(baseUrl));
    console.log('');
  });

// ============================================================
// BANKS
// ============================================================

const banksCmd = program.command('banks').description('Manage banks data');

banksCmd
  .command('list')
  .description('List all banks')
  .option('--limit <n>', 'Limit results', '20')
  .option('--search <term>', 'Search by name')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const params = { 'page[size]': options.limit };
      if (options.search) params['filter[search]'] = options.search;

      const data = await withSpinner('Fetching banks...', () => getBanks(params));

      if (options.json) {
        printJson(data);
        return;
      }

      const banks = data.data || [];
      const tableData = banks.map(b => ({
        id: b.id,
        name: b.attributes?.name || 'N/A',
        code: b.attributes?.code || 'N/A',
        country: b.attributes?.country_code || 'N/A'
      }));

      printTable(tableData, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'country', label: 'Country' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

banksCmd
  .command('get <id>')
  .description('Get bank details by ID')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    try {
      const data = await withSpinner(`Fetching bank ${id}...`, () => getBank(id));

      if (options.json) {
        printJson(data);
        return;
      }

      const bank = data.data?.attributes || {};
      console.log(chalk.bold('\nBank Details\n'));
      console.log('ID:           ', chalk.cyan(data.data?.id || 'N/A'));
      console.log('Name:         ', bank.name || 'N/A');
      console.log('Code:         ', bank.code || 'N/A');
      console.log('Country:      ', bank.country_code || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// CURRENCIES
// ============================================================

const currenciesCmd = program.command('currencies').description('Manage currencies data');

currenciesCmd
  .command('list')
  .description('List all currencies')
  .option('--limit <n>', 'Limit results', '50')
  .option('--search <term>', 'Search by name or code')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const params = { 'page[size]': options.limit };
      if (options.search) params['filter[search]'] = options.search;

      const data = await withSpinner('Fetching currencies...', () => getCurrencies(params));

      if (options.json) {
        printJson(data);
        return;
      }

      const currencies = data.data || [];
      const tableData = currencies.map(c => ({
        id: c.id,
        name: c.attributes?.name || 'N/A',
        code: c.attributes?.code || 'N/A',
        type: c.attributes?.currency_type || 'N/A',
        symbol: c.attributes?.symbol || 'N/A'
      }));

      printTable(tableData, [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'symbol', label: 'Symbol' },
        { key: 'type', label: 'Type' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

currenciesCmd
  .command('get <code>')
  .description('Get currency details by code (e.g., USD, EUR)')
  .option('--json', 'Output as JSON')
  .action(async (code, options) => {
    try {
      const data = await withSpinner(`Fetching currency ${code}...`, () => getCurrency(code));

      if (options.json) {
        printJson(data);
        return;
      }

      const currency = data.data?.attributes || {};
      console.log(chalk.bold('\nCurrency Details\n'));
      console.log('Code:         ', chalk.cyan(data.data?.id || 'N/A'));
      console.log('Name:         ', currency.name || 'N/A');
      console.log('Symbol:       ', currency.symbol || 'N/A');
      console.log('Type:         ', currency.currency_type || 'N/A');
      console.log('Decimals:     ', currency.decimals || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// COUNTRIES
// ============================================================

const countriesCmd = program.command('countries').description('Manage countries data');

countriesCmd
  .command('list')
  .description('List all countries')
  .option('--limit <n>', 'Limit results', '50')
  .option('--search <term>', 'Search by name')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const params = { 'page[size]': options.limit };
      if (options.search) params['filter[search]'] = options.search;

      const data = await withSpinner('Fetching countries...', () => getCountries(params));

      if (options.json) {
        printJson(data);
        return;
      }

      const countries = data.data || [];
      const tableData = countries.map(c => ({
        id: c.id,
        name: c.attributes?.name || 'N/A',
        region: c.attributes?.region || 'N/A',
        currency: c.attributes?.currency_code || 'N/A'
      }));

      printTable(tableData, [
        { key: 'id', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'region', label: 'Region' },
        { key: 'currency', label: 'Currency' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

countriesCmd
  .command('get <code>')
  .description('Get country details by code (e.g., US, GB)')
  .option('--json', 'Output as JSON')
  .action(async (code, options) => {
    try {
      const data = await withSpinner(`Fetching country ${code}...`, () => getCountry(code));

      if (options.json) {
        printJson(data);
        return;
      }

      const country = data.data?.attributes || {};
      console.log(chalk.bold('\nCountry Details\n'));
      console.log('Code:         ', chalk.cyan(data.data?.id || 'N/A'));
      console.log('Name:         ', country.name || 'N/A');
      console.log('Region:       ', country.region || 'N/A');
      console.log('Currency:     ', country.currency_code || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// PAYMENT METHODS
// ============================================================

const paymentMethodsCmd = program.command('payment-methods').description('Manage payment methods');

paymentMethodsCmd
  .command('list')
  .description('List all payment methods')
  .option('--limit <n>', 'Limit results', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const params = { 'page[size]': options.limit };
      const data = await withSpinner('Fetching payment methods...', () => getPaymentMethods(params));

      if (options.json) {
        printJson(data);
        return;
      }

      const methods = data.data || [];
      const tableData = methods.map(m => ({
        id: m.id,
        name: m.attributes?.name || 'N/A',
        category: m.attributes?.category || 'N/A'
      }));

      printTable(tableData, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

paymentMethodsCmd
  .command('get <id>')
  .description('Get payment method details by ID')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    try {
      const data = await withSpinner(`Fetching payment method ${id}...`, () => getPaymentMethod(id));

      if (options.json) {
        printJson(data);
        return;
      }

      const method = data.data?.attributes || {};
      console.log(chalk.bold('\nPayment Method Details\n'));
      console.log('ID:           ', chalk.cyan(data.data?.id || 'N/A'));
      console.log('Name:         ', method.name || 'N/A');
      console.log('Category:     ', method.category || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// ORGANIZATIONS
// ============================================================

const orgsCmd = program.command('organizations').description('Manage organizations data');

orgsCmd
  .command('list')
  .description('List all organizations')
  .option('--limit <n>', 'Limit results', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const params = { 'page[size]': options.limit };
      const data = await withSpinner('Fetching organizations...', () => getOrganizations(params));

      if (options.json) {
        printJson(data);
        return;
      }

      const orgs = data.data || [];
      const tableData = orgs.map(o => ({
        id: o.id,
        name: o.attributes?.name || 'N/A',
        type: o.attributes?.organization_type || 'N/A'
      }));

      printTable(tableData, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

orgsCmd
  .command('get <id>')
  .description('Get organization details by ID')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    try {
      const data = await withSpinner(`Fetching organization ${id}...`, () => getOrganization(id));

      if (options.json) {
        printJson(data);
        return;
      }

      const org = data.data?.attributes || {};
      console.log(chalk.bold('\nOrganization Details\n'));
      console.log('ID:           ', chalk.cyan(data.data?.id || 'N/A'));
      console.log('Name:         ', org.name || 'N/A');
      console.log('Type:         ', org.organization_type || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
