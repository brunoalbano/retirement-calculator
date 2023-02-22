import { ChangeEvent, useCallback, useState } from 'react';
import './App.css';
import { Input } from './components/Input';

interface Config {
  salary: number;
  initialInvestiment: number;
  monthlyInvestiment: number;
  monthlyInvestimentReadjustment: number;
  investmentReturnPercentage: number;
  taxesPercentage: number;
  inflationPercentage: number;
  currentAge: number;
  retirementAge: number;
}

interface Item {
  year: number;
  month: number;
  monthlyInvestiment: number;
  salary: number;
  totalInvestiment: number;
  total: number;
  retired: boolean;
}

function calculate(config: Config) {
  const items: Item[] = [];

  const currentYear = new Date().getFullYear();
  const endYear = currentYear + config.retirementAge - config.currentAge;

  const monthlyInvestimentReadjustment =
    1 + config.monthlyInvestimentReadjustment / 100;
  const inflationPercentage = 1 + config.inflationPercentage / 100;
  const monthlyInvestmentReturnPercentage =
    Math.pow(1 + config.investmentReturnPercentage / 100, 1 / 12) - 1;

  let monthlyInvestiment = config.monthlyInvestiment;
  let salary = config.salary;
  let totalInvestiment = 0;
  let total = 0;
  let retired = false;

  for (let year = currentYear; year < endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      totalInvestiment += monthlyInvestiment;

      const income =
        total *
        monthlyInvestmentReturnPercentage *
        (1 - config.taxesPercentage / 100);

      total += income;
      total += monthlyInvestiment;

      items.push({
        year,
        month,
        monthlyInvestiment,
        salary,
        totalInvestiment,
        total,
        retired
      });
    }

    monthlyInvestiment *= monthlyInvestimentReadjustment;
    salary *= inflationPercentage;
  }

  retired = true;
  monthlyInvestiment = 0;

  for (let year = endYear + 1; total > salary; year++) {
    for (let month = 1; month <= 12 && total > salary; month++) {
      total -= salary;

      const income =
        total *
        monthlyInvestmentReturnPercentage *
        (1 - config.taxesPercentage / 100);

      total += income;

      items.push({
        year,
        month,
        monthlyInvestiment,
        salary,
        totalInvestiment,
        total,
        retired
      });
    }

    salary *= inflationPercentage;
  }

  return items;
}

const currencyFormat = new Intl.NumberFormat('pt-br', {
  style: 'currency',
  currency: 'BRL'
});

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return value;

  return currencyFormat.format(value);
}

function calculateDescription(config: Config, items: Item[]) {
  const startItem = items[0];
  const endItem = items[items.length - 1];
  const retirementItem = items.find(p => p.retired) || endItem;
  const endAge = endItem.year - retirementItem.year + config.retirementAge;

  return `Se aposentando aos ${
    config.retirementAge
  } anos, você consegue tirar um salário de ${formatCurrency(
    config.salary
  )} reajustado pela inflação até os seus ${endAge} anos de idade. 
  Valor investido: ${formatCurrency(retirementItem.totalInvestiment)},
  Valor com rendimentos: ${formatCurrency(retirementItem.total)}`;
}

export default function App() {
  const [config, setConfig] = useState<Config>({
    salary: null as any,
    initialInvestiment: null as any,
    monthlyInvestiment: null as any,
    monthlyInvestimentReadjustment: 0,
    taxesPercentage: 15,
    investmentReturnPercentage: 7.0,
    inflationPercentage: 5.0,
    currentAge: null as any,
    retirementAge: null as any
  });

  const [items, setItems] = useState<Item[]>([]);
  const [description, setDescription] = useState<string>();

  const onChange = useCallback(function (e: ChangeEvent<HTMLInputElement>) {
    setConfig(config => {
      const inputId: keyof Config = e.target.id as any;
      const inputValue = e.target.value;

      const newConfig: Config = { ...config };

      let newValue: number;

      if (inputValue === null || inputValue === undefined || inputValue === '')
        newValue = null as any;
      else {
        newValue = parseFloat(inputValue);

        if (isNaN(newValue)) newValue = 0;
      }

      if (inputId in newConfig) newConfig[inputId] = newValue;

      return newConfig;
    });
  }, []);

  function recalculate() {
    setItems(calculate(config));
    setDescription(calculateDescription(config, items));
  }

  return (
    <div>
      <Input
        id='salary'
        label='Salário'
        placeholder='0,00'
        type='number'
        step='0.01'
        value={config.salary}
        onChange={onChange}
      />

      <Input
        id='initialInvestiment'
        label='Aporte inicial'
        placeholder='0,00'
        type='number'
        step='0.01'
        value={config.initialInvestiment}
        onChange={onChange}
      />

      <Input
        id='monthlyInvestiment'
        label='Aporte mensal'
        placeholder='0,00'
        type='number'
        step='0.01'
        value={config.monthlyInvestiment}
        onChange={onChange}
      />

      <Input
        id='monthlyInvestimentReadjustment'
        label='Percentual de reajuste do Aporte mensal'
        placeholder='0'
        type='number'
        step='0.01'
        value={config.monthlyInvestimentReadjustment}
        onChange={onChange}
      />

      <Input
        id='taxesPercentage'
        label='Percentual de imposto de renda'
        placeholder='0'
        type='number'
        step='0.01'
        value={config.taxesPercentage}
        onChange={onChange}
      />

      <Input
        id='investmentReturnPercentage'
        label='Percentual investimento anual'
        placeholder='0,00'
        type='number'
        step='0.01'
        value={config.investmentReturnPercentage}
        onChange={onChange}
      />

      <Input
        id='inflationPercentage'
        label='Inflation Percentage'
        placeholder='0,00'
        type='number'
        step='0.01'
        value={config.inflationPercentage}
        onChange={onChange}
      />

      <Input
        id='currentAge'
        label='Current Age'
        placeholder='0'
        type='number'
        step='1'
        value={config.currentAge}
        onChange={onChange}
      />

      <Input
        id='retirementAge'
        label='Retirement Age'
        placeholder='0'
        type='number'
        step='1'
        value={config.retirementAge}
        onChange={onChange}
      />

      <button
        type='button'
        className='mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
        onClick={recalculate}
      >
        Calculate
      </button>

      <pre>{JSON.stringify(config, null, '  ')}</pre>

      <code>{description}</code>

      {items && items.length && (
        <table className='w-full text-left text-sm text-gray-500 dark:text-gray-400'>
          <thead className='bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope='col' className='px-6 py-3'>
                Data
              </th>
              <th scope='col' className='px-6 py-3'>
                Aporte mensal
              </th>
              <th scope='col' className='px-6 py-3'>
                Total investido
              </th>
              <th scope='col' className='px-6 py-3'>
                Total com juros
              </th>
              <th scope='col' className='px-6 py-3'>
                Salário reajustado
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr className='border-b bg-white dark:border-gray-700 dark:bg-gray-800'>
                <td className='px-6 py-4'>
                  {item.year}/{item.month.toString().padStart(2, '0')}
                </td>
                <td className='px-6 py-4'>
                  {formatCurrency(item.monthlyInvestiment)}
                </td>
                <td className='px-6 py-4'>
                  {formatCurrency(item.totalInvestiment)}
                </td>
                <td className='px-6 py-4'>{formatCurrency(item.total)}</td>
                <td className='px-6 py-4'>{formatCurrency(item.salary)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
