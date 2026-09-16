/**
 * Hand-written digital-SAT-style items, modeled on the College Board Question
 * Bank's domains and phrasing (their text is copyrighted; these are original).
 *
 * Keyed by the SAT skill's primary generator id in courses.ts. Every entry is
 * registered as generator `bank.<key>` and drawn round-robin with the
 * procedural generator, so lessons mix both. Item = [prompt, answer, ...3 distractors].
 */

export type BankItem = [prompt: string, answer: string | number, ...distractors: (string | number)[]];

export const SAT_BANK: Record<string, { instruction: string; items: BankItem[] }> = {
  /* ------------------------------------------------------------ Algebra */
  satSolveLinear: {
    instruction: 'Solve for x',
    items: [
      ['3(x − 4) = 2x + 5', 17, 7, -7, 1],
      ['5x + 2 = 3x − 10', -6, 6, -4, 4],
      ['(x + 3)/2 = 7', 11, 4, 17, 5],
      ['2(3x − 1) − 4x = 10', 6, 4, 12, 3],
      ['4x − 7 = 2(x + 4)', 7.5, 15, '1/2', 4],
      ['x/3 + x/6 = 9', 18, 27, 6, 3],
      ['0.5x + 3 = 0.2x + 9', 20, 40, 2, 12],
      ['−2(x + 5) = 3x', -2, 2, -10, 10],
      ['7 − 3(x − 1) = 1', 3, -3, 2, 6],
      ['If 3x + 5 = 20, what is the value of 6x + 10?', 40, 5, 20, 30],
      ['If 2x − 3 = 11, what is the value of x²?', 49, 7, 14, 16],
      ['9 = (2/3)x − 1', 15, 12, 6, '20/3'],
      ['5(x + 2) − 3 = 22', 3, 5, 3.4, 6],
    ],
  },

  satLinearWord: {
    instruction: 'Linear model',
    items: [
      [
        'A gym charges $25 to join plus $15 per month. Which equation gives the total cost C after m months?',
        'C = 15m + 25', 'C = 25m + 15', 'C = 40m', 'C = 15m − 25',
      ],
      ['A plumber charges $60 per visit plus $45 per hour. A job costs $240. How many hours did it take?', 4, 5, 3, 6],
      ['A town had 8,000 people in 2010 and grows by 250 people per year. What is its population in 2020?', 10500, 10250, 12500, 9000],
      [
        'A tank holds 500 gallons and drains at 20 gallons per minute. Which equation gives the volume V after t minutes?',
        'V = 500 − 20t', 'V = 20t + 500', 'V = 20 − 500t', 'V = 480t',
      ],
      ['A taxi charges $3.00 plus $2.50 per mile. A ride costs $18.00. How many miles was the ride?', 6, 5, 7, 7.2],
      [
        'The cost c, in dollars, of parking for h hours is c = 4h + 3. What does the 4 represent?',
        'The cost per hour', 'The total cost', 'The initial fee', 'The number of hours',
      ],
      [
        'A phone plan costs $30 per month plus $0.10 per text. Which equation gives the monthly cost C for t texts?',
        'C = 0.10t + 30', 'C = 30t + 0.10', 'C = 0.10(t + 30)', 'C = 30 − 0.10t',
      ],
      ['A rental car costs $40 per day plus $0.25 per mile. What is the cost of a 3-day rental with 200 miles driven?', 170, 160, 130, 250],
      ['A salesperson earns $400 per week plus 8% commission on sales. What sales total earns $1,000 in a week?', 7500, 6000, 12500, 8000],
      ['The temperature is 68°F and drops 3°F per hour. After how many hours is it 50°F?', 6, 5, 4, 18],
      ['The height h, in cm, of a plant t days after planting is h = 1.5t + 20. How tall was the plant when planted?', 20, 1.5, 21.5, 0],
      [
        'A candle is 12 inches tall and burns 0.5 inch per hour. Which equation gives its height h after t hours?',
        'h = 12 − 0.5t', 'h = 0.5t − 12', 'h = 12t − 0.5', 'h = 0.5t + 12',
      ],
      ['A subscription costs $9 per month plus a one-time $20 setup fee. What is the total cost for one year?', 128, 29, 240, 348],
    ],
  },

  system2: {
    instruction: 'System of equations',
    items: [
      ['x + y = 10\nx − y = 4\n\nWhat is the value of x?', 7, 3, 6, 14],
      ['2x + y = 11\nx − y = 1\n\nWhat is the value of y?', 3, 4, 5, 7],
      ['3x + 2y = 16\nx = 2y\n\nWhat is the value of x + y?', 6, 4, 2, 8],
      ['y = 2x + 1\ny = −x + 7\n\nWhat is the value of xy?', 10, 7, 2, 5],
      ['4x − 3y = 6\n2x + 3y = 12\n\nWhat is the value of y?', 2, 3, 6, 1],
      ['2x + 4y = 8\nx + 2y = 4\n\nHow many solutions does the system have?', 'Infinitely many', 'Exactly one', 'Zero', 'Exactly two'],
      ['3x + y = 7\n6x + 2y = 10\n\nHow many solutions does the system have?', 'Zero', 'Exactly one', 'Infinitely many', 'Exactly two'],
      ['Adult tickets cost $8 and child tickets cost $5. 30 tickets were sold for $195. How many adult tickets were sold?', 15, 10, 20, 12],
      ['The sum of two numbers is 24 and their difference is 6. What is the larger number?', 15, 9, 18, 12],
      ['y = 3x + 2\ny = kx − 5\n\nFor what value of k does the system have no solution?', 3, -3, 2, -5],
      ['A pen costs twice as much as a pencil. 3 pens and 4 pencils cost $5.00. What does one pen cost?', '$1.00', '$0.50', '$1.50', '$2.00'],
      ['5x − 2y = 4\nx + 2y = 8\n\nWhat is the value of x − y?', -1, 1, 5, -5],
      ['x + y = 5\n2x + 3y = 12\n\nWhat is the value of y?', 2, 3, 1, 4],
    ],
  },

  inequalityFlip: {
    instruction: 'Inequality',
    items: [
      ['Solve: −3x + 4 > 13', 'x < −3', 'x > −3', 'x < 3', 'x > 3'],
      ['Solve: 2x − 5 ≤ 9', 'x ≤ 7', 'x ≥ 7', 'x ≤ 2', 'x < 7'],
      ['Which value is a solution of 5 − 2x < 1?', 3, 2, 1, 0],
      ['Solve: −x/2 ≥ 4', 'x ≤ −8', 'x ≥ −8', 'x ≤ 8', 'x ≥ 8'],
      ['Solve: 4(x − 1) > 2x + 6', 'x > 5', 'x < 5', 'x > 1', 'x > 2.5'],
      ['A student needs an average of at least 80 on four tests. The first three scores are 72, 85 and 78. What is the minimum score on the fourth test?', 85, 80, 84, 86],
      ['With $50, a student buys an $8 bag and notebooks at $3 each. What is the greatest number of notebooks the student can buy?', 14, 13, 15, 16],
      ['Solve: −5 < 2x + 1 < 7', '−3 < x < 3', '−3 < x < 4', '−2 < x < 3', 'x < 3'],
      ['Which value is NOT in the solution set of 3x + 2 ≥ 11?', 2, 3, 4, 5],
      ['Solve: x − 7 < 2x + 1', 'x > −8', 'x < −8', 'x > 8', 'x < 8'],
      ['A truck can carry at most 2,000 lb. It already holds 380 lb and is loaded with 45-lb boxes. What is the maximum number of boxes?', 36, 35, 37, 44],
      ['If −2 ≤ x ≤ 5, what is the greatest possible value of 3 − 2x?', 7, -7, 13, 3],
    ],
  },

  /* --------------------------------------------- Problem solving & data */
  satPercentWord: {
    instruction: 'Percents',
    items: [
      ['A jacket is 30% off and the sale price is $56. What was the original price?', 80, 72.8, 86, 76],
      ['18 is what percent of 40?', '45%', '22%', '40%', '72%'],
      ['A population grew from 1,200 to 1,500. What was the percent increase?', '25%', '20%', '30%', '300%'],
      ['After a 15% raise, a salary is $46,000. What was the salary before the raise?', 40000, 39100, 41000, 52900],
      ['A $50 item is marked up 20%, then discounted 20%. What is the final price?', 48, 50, 52, 40],
      ['What is 12.5% of 640?', 80, 8, 64, 800],
      ['An 8% tax is added to a $75 bill. What is the total?', 81, 83, 75.8, 69],
      ['A car worth $25,000 loses 12% of its value in a year. What is it worth after one year?', 22000, 23000, 28000, 3000],
      ['35% of a class of 40 students are boys. How many are girls?', 26, 14, 24, 35],
      ['A number increased by 40% is 84. What is the number?', 60, 50.4, 44, 117.6],
      ['Sales fell from 250 to 200. What was the percent decrease?', '20%', '25%', '50%', '80%'],
      ['Which is greater: 15% of 80 or 80% of 15?', 'They are equal', '15% of 80', '80% of 15', 'Cannot be determined'],
      ['3 of the 8 marbles in a bag are red. What percent are red?', '37.5%', '3%', '35%', '40%'],
    ],
  },

  satRateWord: {
    instruction: 'Rates & proportions',
    items: [
      ['A recipe uses 3 cups of flour for every 2 cups of sugar. How much flour goes with 5 cups of sugar?', 7.5, 6, 8, '10/3'],
      ['A printer prints 45 pages in 3 minutes. How many pages does it print in 8 minutes?', 120, 135, 15, 360],
      ['5 workers build a wall in 12 hours. At the same rate, how long would 3 workers take?', 20, 7.2, 36, 15],
      ['A map scale is 1 inch : 25 miles. Two cities are 3.5 inches apart on the map. What is the actual distance in miles?', 87.5, 75, 28.5, 7.14],
      ['A car uses 4 gallons of gas to go 120 miles. How many gallons does it need for 300 miles?', 10, 7.5, 12, 9],
      ['The ratio of cats to dogs at a shelter is 3:5. There are 40 animals. How many are cats?', 15, 25, 24, 12],
      ['A pump moves 250 liters in 20 minutes. What is its rate in liters per hour?', 750, 12.5, 500, 5000],
      ['A runner covers 6 miles in 48 minutes. What is the average pace in minutes per mile?', 8, 6, 7.5, 12.5],
      ['If x/6 = 15/9, what is x?', 10, 12, 22.5, 9],
      ['A machine makes 8 parts every 5 minutes. How many parts does it make in 2 hours?', 192, 96, 200, 48],
      ['y is directly proportional to x. When x = 4, y = 14. What is y when x = 10?', 35, 20, 28, 40],
      ['A train travels 180 miles in 2.5 hours. What is its average speed in mph?', 72, 90, 450, 60],
      ['12 eggs cost $3.60. What do 30 eggs cost, in dollars?', 9, 7.2, 10.8, 12],
    ],
  },

  satUnitConvert: {
    instruction: 'Unit conversion',
    items: [
      ['How many minutes are in 3.5 hours?', 210, 350, 180, 240],
      ['A car travels 90 km/h. What is its speed in meters per second?', 25, 15, 30, 54],
      ['1 mile = 5,280 feet. How many feet are in 2.5 miles?', 13200, 10560, 2112, 15840],
      ['1 inch = 2.54 cm. How many centimeters are in 20 inches?', 50.8, 7.87, 22.54, 45.4],
      ['How many seconds are in 2 days?', 172800, 86400, 2880, 120000],
      ['1 kg ≈ 2.2 lb. A 55-lb dog weighs about how many kg?', 25, 121, 50, 27.5],
      ['A room is 12 ft by 15 ft. What is its area in square yards?', 20, 60, 540, 30],
      ['1 gallon = 4 quarts. How many quarts are in 6.5 gallons?', 26, 24, 1.625, 10.5],
      ['Water flows at 30 gallons per minute. How many gallons flow in one day?', 43200, 1800, 720, 72000],
      ['Convert 2,500 meters to kilometers.', 2.5, 25, 250, 0.25],
      ['A cube has edges of 2 feet. What is its volume in cubic inches?', 13824, 96, 1152, 8],
      ['1 mile ≈ 1.6 km. A 10-km race is about how many miles?', 6.25, 16, 8.4, 4],
    ],
  },

  satTableData: {
    instruction: 'Two-way table',
    items: [
      ['            Bus   Walk\nFreshmen     24     16\nSophomores   30     10\n\nWhat fraction of sophomores walk?', '1/4', '1/8', '1/3', '3/4'],
      ['            Bus   Walk\nFreshmen     24     16\nSophomores   30     10\n\nWhat percent of all students take the bus?', '67.5%', '54%', '60%', '75%'],
      ['            Bus   Walk\nFreshmen     24     16\nSophomores   30     10\n\nA bus rider is chosen at random. What is the probability they are a freshman?', '4/9', '3/10', '4/5', '1/2'],
      ['          Pass  Fail\nMorning    36    14\nEvening    28    22\n\nHow many students are in the table?', 100, 64, 50, 86],
      ['          Pass  Fail\nMorning    36    14\nEvening    28    22\n\nWhat percent of evening students passed?', '56%', '28%', '44%', '64%'],
      ['          Pass  Fail\nMorning    36    14\nEvening    28    22\n\nA student is chosen at random. What is the probability they are a morning student who passed?', '9/25', '36/64', '18/25', '9/50'],
      ['          Pass  Fail\nMorning    36    14\nEvening    28    22\n\nWhat fraction of the students who failed were in the morning class?', '7/18', '7/25', '11/18', '1/2'],
      ['        Soccer  Tennis  Total\nBoys      18      12      30\nGirls     14      26      40\n\nA student is chosen at random. What is the probability they play tennis?', '19/35', '3/5', '13/20', '12/35'],
      ['        Soccer  Tennis  Total\nBoys      18      12      30\nGirls     14      26      40\n\nAmong girls, what is the ratio of soccer players to tennis players?', '7:13', '7:20', '13:7', '9:7'],
      ['        Soccer  Tennis  Total\nBoys      18      12      30\nGirls     14      26      40\n\nWhat percent of soccer players are boys?', '56.25%', '60%', '45%', '18%'],
      ['         Red   Blue  Total\nCars      15     ?     40\nTrucks     9    11     20\n\nHow many blue cars are there?', 25, 15, 20, 31],
      ['         Red   Blue  Total\nCars      15    25     40\nTrucks     9    11     20\n\nWhat fraction of the red vehicles are trucks?', '3/8', '3/20', '3/5', '9/20'],
    ],
  },

  satScatter: {
    instruction: 'Line of best fit',
    items: [
      ['A line of best fit is y = 2.5x + 40, where x is hours studied and y is test score. What score is predicted for 8 hours?', 60, 50, 42.5, 20],
      ['A line of best fit is y = 2.5x + 40, where x is hours studied and y is test score. By how much does the predicted score rise per extra hour?', 2.5, 40, 42.5, 8],
      ['y = −3x + 90 models temperature y (°F) against elevation x (thousands of feet). What temperature is predicted at 5,000 feet?', 75, 105, 87, 15],
      [
        'The slope of a line of best fit is negative. Which statement is true?',
        'As x increases, y tends to decrease', 'As x increases, y tends to increase', 'x and y are unrelated', 'All points lie on the line',
      ],
      [
        'A data point lies above the line of best fit. Its actual y-value is…',
        'greater than the predicted value', 'less than the predicted value', 'equal to the predicted value', 'an error in the data',
      ],
      ['y = 0.8x + 12 models a plant’s height y (cm) after x days. What was the height on day 0?', 12, 0.8, 12.8, 0],
      ['A line of best fit is y = 15x + 200. For the data point (10, 380), what is actual − predicted?', 30, -30, 350, 180],
      ['Which correlation coefficient indicates the strongest linear relationship?', '−0.92', '0.45', '0.80', '−0.10'],
      ['A line of best fit is y = 1.2x + 5. What y is predicted when x = 25?', 35, 30, 31, 25],
      ['A line of best fit is y = 4x + 10. Where is the data point (5, 26) relative to the line?', 'Below the line', 'Above the line', 'On the line', 'Cannot be determined'],
      ['y = 50 − 2x models battery percent y after x hours. After how many hours does the model predict 0%?', 25, 50, 2, 48],
      ['A scatterplot shows a strong positive association. Which could be the slope of its line of best fit?', 3, -3, 0, -0.5],
    ],
  },

  centerSpread: {
    instruction: 'Statistics',
    items: [
      ['Data: 4, 8, 8, 10, 15. What is the mean?', 9, 8, 10, 11],
      ['Data: 4, 8, 8, 10, 15. What is the median?', 8, 9, 10, 11],
      ['Data: 3, 7, 7, 9, 12, 14. What is the median?', 8, 7, 9, 12],
      [
        'Set A: 10, 12, 14.  Set B: 2, 12, 22. Which is true?',
        'Same mean; B has the greater standard deviation', 'Same mean; A has the greater standard deviation', 'Different means; same standard deviation', 'Same mean and same standard deviation',
      ],
      ['The mean of five numbers is 20. Four of them are 15, 18, 22 and 25. What is the fifth?', 20, 18, 25, 16],
      ['Data: 2, 3, 3, 5, 5, 5, 9. What is the mode?', 5, 3, 4, 9],
      ['What is the range of 12, 7, 19, 4, 15?', 15, 19, 11, 12],
      [
        'A data set has mean 50 and median 40. Which is most likely?',
        'It is skewed right by a few large values', 'It is skewed left by a few small values', 'It is symmetric', 'Every value is 45',
      ],
      ['Every value in a data set is increased by 5. Which statistic changes?', 'The mean', 'The range', 'The standard deviation', 'None of them'],
      ['Scores: 70, 80, 90, 100. If a score of 60 is added, the median…', 'decreases by 5', 'increases by 5', 'stays the same', 'decreases by 10'],
      ['Three numbers have mean 12 and two other numbers have mean 17. What is the mean of all five?', 14, 14.5, 15, 29],
      ['Which statistic is most affected by an outlier?', 'Mean', 'Median', 'Mode', 'None of these'],
      ['A random sample of 200 students from a school of 2,000 finds 30% own a bike. Best estimate of bike owners in the school?', 600, 60, 300, 2000],
    ],
  },

  /* ------------------------------------------------------ Advanced math */
  satFunctionNotation: {
    instruction: 'Function notation',
    items: [
      ['f(x) = 3x − 7. What is f(4)?', 5, -5, 19, 12],
      ['g(x) = x² + 2x. What is g(−3)?', 3, -3, 15, 9],
      ['f(x) = 2x + 1. For what value of x is f(x) = 15?', 7, 31, 8, 14],
      ['f(x) = x² − 1 and g(x) = x + 3. What is f(g(1))?', 15, 3, 7, 8],
      ['h(x) = 5 − x. What is h(h(2))?', 2, 3, 5, 0],
      ['f(x) = 4x. What is f(a + 1) − f(a)?', 4, 1, '4a', 0],
      ['x:    1   2   3   4\nf(x): 5   8  11  14\n\nf is linear. What is f(6)?', 20, 17, 18, 24],
      ['Which linear function has f(2) = 10 and f(0) = 4?', 'f(x) = 3x + 4', 'f(x) = 5x', 'f(x) = 2x + 6', 'f(x) = 4x + 2'],
      ['f(x) = x/2 + 3. What is f(10) + f(0)?', 11, 8, 5, 13],
      ['f(x) = (x − 2)(x + 5). For which values of x is f(x) = 0?', '2 and −5', '−2 and 5', '2 and 5', '−2 and −5'],
      ['g(x) = 2ˣ. What is g(5)?', 32, 10, 25, 16],
      ['f(x) = 3x + b and f(2) = 11. What is b?', 5, 6, 17, 2],
      ['f(x) = |x − 4|. What is f(1)?', 3, -3, 5, 1],
    ],
  },

  quadFormula: {
    instruction: 'Quadratics',
    items: [
      ['x² − 5x + 6 = 0. What is the sum of the solutions?', 5, -5, 6, 1],
      ['What are the solutions of x² − 2x − 15 = 0?', '5 and −3', '−5 and 3', '5 and 3', '−5 and −3'],
      ['What are the solutions of x² = 49?', '7 and −7', '7 only', '24.5', '−49 and 49'],
      ['What is the vertex of y = (x − 3)² + 2?', '(3, 2)', '(−3, 2)', '(3, −2)', '(2, 3)'],
      ['What is the discriminant of 2x² + 3x + 5 = 0?', -31, 31, 49, -11],
      ['How many real solutions does x² + 4x + 4 = 0 have?', 'Exactly one', 'Zero', 'Two', 'Infinitely many'],
      ['2x² − 8 = 0. What is the positive solution?', 2, 4, 8, 16],
      ['y = x² − 6x + 5. What is the x-coordinate of the vertex?', 3, -3, 6, 5],
      ['x² + 3x = 10. What is the product of the solutions?', -10, 10, -3, 3],
      ['A ball’s height is h = −16t² + 64t. At what time t > 0 does it hit the ground?', 4, 2, 64, 16],
      ['A ball’s height is h = −16t² + 64t. What is its maximum height?', 64, 32, 128, 48],
      ['What are the solutions of x² + 6x + 7 = 0?', '−3 ± √2', '3 ± √2', '−3 ± √7', '−6 ± √2'],
      ['Which equation has solutions x = 4 and x = −1?', 'x² − 3x − 4 = 0', 'x² + 3x − 4 = 0', 'x² − 3x + 4 = 0', 'x² + 3x + 4 = 0'],
    ],
  },

  factorTrinomial: {
    instruction: 'Factor',
    items: [
      ['x² + 7x + 12', '(x + 3)(x + 4)', '(x + 2)(x + 6)', '(x + 1)(x + 12)', '(x − 3)(x − 4)'],
      ['x² − 9', '(x − 3)(x + 3)', '(x − 3)²', '(x + 3)²', '(x − 9)(x + 1)'],
      ['2x² + 5x − 3', '(2x − 1)(x + 3)', '(2x + 1)(x − 3)', '(2x − 3)(x + 1)', '(2x + 3)(x − 1)'],
      ['x² − 8x + 16', '(x − 4)²', '(x + 4)²', '(x − 2)(x − 8)', '(x − 4)(x + 4)'],
      ['3x² − 12x', '3x(x − 4)', '3x(x + 4)', 'x(3x − 4)', '3(x − 4)'],
      ['Which is a factor of x² − x − 20?', 'x − 5', 'x + 5', 'x − 4', 'x − 20'],
      ['4x² − 25', '(2x − 5)(2x + 5)', '(2x − 5)²', '(4x − 5)(x + 5)', '(2x − 25)(2x + 1)'],
      ['x² + bx + 18 = (x + 2)(x + 9). What is b?', 11, 18, 7, -11],
      ['x² − 3x − 28', '(x − 7)(x + 4)', '(x + 7)(x − 4)', '(x − 14)(x + 2)', '(x − 7)(x − 4)'],
      ['6x² + 11x + 4', '(2x + 1)(3x + 4)', '(2x + 4)(3x + 1)', '(6x + 1)(x + 4)', '(2x − 1)(3x − 4)'],
      ['Factor completely: 2x² − 18', '2(x − 3)(x + 3)', '2(x − 3)²', '(2x − 9)(x + 2)', '2(x² − 9)'],
      ['x² − 10x + c = (x − 5)². What is c?', 25, 10, -25, 5],
    ],
  },

  expRules: {
    instruction: 'Simplify',
    items: [
      ['x⁵ · x³', 'x⁸', 'x¹⁵', 'x²', '2x⁸'],
      ['(2x³)²', '4x⁶', '2x⁶', '4x⁵', '2x⁵'],
      ['x⁸ / x²', 'x⁶', 'x⁴', 'x¹⁰', '1'],
      ['(x²)⁵', 'x¹⁰', 'x⁷', 'x³', '5x²'],
      ['3⁻²', '1/9', '−9', '−6', '1/6'],
      ['If 2ˣ = 32, what is x?', 5, 16, 4, 6],
      ['√x · √x, for x > 0', 'x', '2√x', 'x²', '√(2x)'],
      ['x^(1/2) · x^(3/2)', 'x²', 'x^(3/4)', 'x^(1/3)', 'x³'],
      ['(4x⁴y²) / (2x²y)', '2x²y', '2x²y²', '2x⁶y³', '8x²y'],
      ['If 3ˣ⁺¹ = 81, what is x?', 3, 4, 27, 2],
      ['8^(2/3)', 4, 16, 5.33, 2],
      ['(x³y)² · x', 'x⁷y²', 'x⁶y²', 'x⁵y²', 'x⁷y'],
      ['5⁰ + 5¹', 6, 5, 1, 10],
    ],
  },

  satExpGrowth: {
    instruction: 'Exponential growth & decay',
    items: [
      [
        'A population of 500 grows 6% per year. Which expression gives the population after t years?',
        '500(1.06)ᵗ', '500(0.06)ᵗ', '500 + 1.06t', '500(1.6)ᵗ',
      ],
      ['A car worth $20,000 loses 15% of its value each year. What is it worth after 2 years?', 14450, 17000, 14000, 15000],
      [
        'f(t) = 300 · 2^(t/5) models a quantity after t years. What does the 5 represent?',
        'The number of years it takes to double', 'The initial amount', 'The growth rate as a percent', 'The number of years modeled',
      ],
      ['A colony of 100 bacteria doubles every 3 hours. How many bacteria are there after 12 hours?', 1600, 400, 800, 1200],
      ['$1,000 earns 5% interest compounded annually. What is the balance after 2 years?', '1102.50', 1100, 1050, 1105],
      ['Which function represents exponential decay?', 'f(x) = 40(0.85)ˣ', 'f(x) = 40(1.85)ˣ', 'f(x) = 40 + 0.85x', 'f(x) = 0.85(40)ˣ'],
      ['y = 250(1.04)ˣ. By what percent does y grow each time x increases by 1?', '4%', '104%', '1.04%', '40%'],
      ['A substance loses half its mass every 10 days. What fraction remains after 30 days?', '1/8', '1/3', '1/6', '1/16'],
      ['y = 80(0.5)ˣ. What is the initial value?', 80, 40, 0.5, 160],
      ['An investment triples every 8 years. Starting at $2,000, what is it worth after 16 years?', 18000, 6000, 12000, 54000],
      ['Which function is linear rather than exponential?', 'y = 3x + 2', 'y = 3(2)ˣ', 'y = 2ˣ', 'y = 5(0.5)ˣ'],
      ['A town of 12,000 shrinks 2% per year. What is its population after one year?', 11760, 11800, 12240, 9600],
    ],
  },

  rationalSimplify: {
    instruction: 'Rational expressions',
    items: [
      ['Simplify (x² − 4)/(x − 2), x ≠ 2', 'x + 2', 'x − 2', 'x² − 2', 'x + 4'],
      ['Simplify 3x/x², x ≠ 0', '3/x', '3x', 'x/3', '3'],
      ['Simplify (x² + 5x + 6)/(x + 3), x ≠ −3', 'x + 2', 'x + 3', 'x + 6', 'x² + 2'],
      ['1/x + 1/(2x)', '3/(2x)', '2/(3x)', '1/(3x)', '2/(2x)'],
      ['Simplify (2x + 6)/(x + 3), x ≠ −3', 2, 'x + 2', '2x', 6],
      ['Simplify (x² − 9)/(x² + 3x)', '(x − 3)/x', '(x + 3)/x', '−9/(3x)', '(x − 3)/(x + 3)'],
      ['For what value of x does 5/(x − 4) have no value?', 4, -4, 0, 5],
      ['(x/3) ÷ (x/6), x ≠ 0', 2, '1/2', 'x²/18', 'x/2'],
      ['Solve: 12/x = 3', 4, 36, '1/4', 9],
      ['(x + 1)/x − 1/x, x ≠ 0', 1, 'x', '1/x', '(x + 2)/x'],
      ['(x² − 1)/(x + 1) · 1/(x − 1)', 1, 'x − 1', 'x + 1', 'x² − 1'],
      ['Solve: (x + 2)/4 = (x − 1)/2', 4, 2, -4, 1],
    ],
  },

  /* ----------------------------------------------------- Geometry & trig */
  pythag: {
    instruction: 'Right triangles',
    items: [
      ['A right triangle has legs 6 and 8. What is the hypotenuse?', 10, 14, 7, 12],
      ['A right triangle has hypotenuse 13 and one leg 5. What is the other leg?', 12, 8, 18, 14],
      ['A right triangle has legs 5 and 5. What is the hypotenuse?', '5√2', 10, 5, '2√5'],
      ['A 15-ft ladder leans against a wall with its base 9 ft from the wall. How high up the wall does it reach?', 12, 6, 24, 17.5],
      ['What is the distance between (1, 2) and (4, 6)?', 5, 7, 25, '√7'],
      ['Which side lengths form a right triangle?', '9, 12, 15', '5, 6, 7', '8, 10, 12', '4, 5, 6'],
      ['In a 30-60-90 triangle the shortest side is 4. What is the hypotenuse?', 8, '4√3', '4√2', 12],
      ['In a 30-60-90 triangle the shortest side is 4. What is the longer leg?', '4√3', 8, '4√2', '2√3'],
      ['A square has side 6. What is the length of its diagonal?', '6√2', 12, 6, '3√2'],
      ['A rectangle is 8 by 15. What is the length of its diagonal?', 17, 23, 11.5, 19],
      ['A 45-45-90 triangle has hypotenuse 10. What is the length of each leg?', '5√2', 5, '10√2', '2√5'],
      ['A right triangle has legs 7 and 24. What is the hypotenuse?', 25, 31, 17, 26],
      ['A right triangle has hypotenuse 2√13 and one leg 4. What is the other leg?', 6, 8, 3, 9],
    ],
  },

  satTrig: {
    instruction: 'Trigonometry',
    items: [
      ['A right triangle has legs 3 and 4 and hypotenuse 5. θ is opposite the side of length 3. What is sin θ?', '3/5', '4/5', '3/4', '5/3'],
      ['A right triangle has legs 3 and 4 and hypotenuse 5. θ is opposite the side of length 3. What is tan θ?', '3/4', '4/3', '3/5', '4/5'],
      ['In a right triangle, cos A = 12/13. What is sin A?', '5/13', '12/5', '13/12', '5/12'],
      ['In a right triangle, sin x° = cos y°. What is x + y?', 90, 180, 45, 0],
      ['If sin θ = 0.6, what is cos(90° − θ)?', 0.6, 0.4, 0.8, 0.36],
      ['A ramp rises 3 ft over a horizontal run of 12 ft. What is the tangent of its angle of elevation?', '1/4', '1/3', 4, '1/5'],
      ['What is sin 30°?', '1/2', '√3/2', '√2/2', '√3/3'],
      ['What is tan 45°?', 1, 0, '√2', '√3'],
      ['What is cos 60°?', '1/2', '√3/2', '√2/2', 0],
      ['Right triangle ABC has its right angle at C. AB = 10 and sin A = 0.8. What is BC?', 8, 6, 12.5, 0.08],
      ['A tree casts a 20-ft shadow. The sun’s angle of elevation θ has tan θ = 1.5. How tall is the tree?', 30, 13.3, 21.5, 10],
      ['sin²θ + cos²θ = ?', 1, 0, 2, 'sin 2θ'],
      ['tan θ = 5/12 and θ is acute. What is sin θ?', '5/13', '12/13', '5/12', '12/5'],
    ],
  },

  satCircleEq: {
    instruction: 'Circles',
    items: [
      ['What is the center of (x − 3)² + (y + 2)² = 25?', '(3, −2)', '(−3, 2)', '(3, 2)', '(−3, −2)'],
      ['What is the radius of (x − 3)² + (y + 2)² = 25?', 5, 25, 3, 12.5],
      ['Which is the equation of a circle centered at the origin with radius 4?', 'x² + y² = 16', 'x² + y² = 4', 'x² + y² = 8', '(x − 4)² + y² = 16'],
      ['x² + y² − 6x + 4y − 3 = 0. What is the radius?', 4, 3, 16, 2],
      ['x² + y² − 6x + 4y − 3 = 0. What is the center?', '(3, −2)', '(−3, 2)', '(6, −4)', '(−6, 4)'],
      ['A circle has radius 6. What is its area?', '36π', '12π', '6π', 36],
      ['What is the length of a 90° arc on a circle of radius 8?', '4π', '16π', '2π', '8π'],
      ['What is the area of a 60° sector of a circle with radius 6?', '6π', '12π', '36π', '3π'],
      ['A circle has circumference 10π. What is its radius?', 5, 10, 2.5, 25],
      ['The point (a, 4) lies on x² + y² = 25 and a > 0. What is a?', 3, 5, 9, 4],
      ['A circle centered at (1, 1) passes through (4, 5). What is its radius?', 5, 7, 25, 3],
      ['A central angle of 2 radians in a circle of radius 3 cuts off an arc of what length?', 6, '6π', 3, 1.5],
      ['A circle has diameter 14. What is the length of its longest chord?', 14, 7, '14π', 28],
    ],
  },

  volumeSolids: {
    instruction: 'Volume',
    items: [
      ['A cylinder has radius 3 and height 5. What is its volume?', '45π', '15π', '30π', '90π'],
      ['A cone has radius 3 and height 4. What is its volume?', '12π', '36π', '24π', '4π'],
      ['A sphere has radius 3. What is its volume?', '36π', '12π', '27π', '108π'],
      ['A box measures 4 by 5 by 6. What is its volume?', 120, 15, 60, 148],
      ['A cube has volume 64. What is its edge length?', 4, 8, 16, 32],
      ['A cylinder has volume 100π and radius 5. What is its height?', 4, 20, 10, 2],
      ['A square pyramid has base side 6 and height 10. What is its volume?', 120, 360, 60, 180],
      ['A cylinder’s radius is doubled and its height stays the same. Its volume is multiplied by…', 4, 2, 8, 16],
      ['A cube has edge 5. What is its surface area?', 150, 125, 25, 100],
      ['A tank measures 2 m by 3 m by 1.5 m. What is its volume in liters? (1 m³ = 1,000 L)', 9000, 900, 6500, 90000],
      ['A sphere has diameter 12. What is its volume?', '288π', '144π', '2304π', '48π'],
      ['A cone has volume 50π and height 6. What is its radius?', 5, 25, 10, 2.5],
    ],
  },

  complexArith: {
    instruction: 'Complex numbers',
    items: [
      ['(3 + 2i) + (1 − 5i)', '4 − 3i', '4 + 3i', '2 + 7i', '4 − 7i'],
      ['(2 + i)(3 − i)', '7 + i', '5 + i', '6 − i', '7 − i'],
      ['i²', -1, 1, 'i', '−i'],
      ['i⁴', 1, -1, 'i', '−i'],
      ['(4 − 3i) − (2 − 5i)', '2 + 2i', '2 − 8i', '6 − 8i', '2 − 2i'],
      ['(1 + i)²', '2i', 2, '1 + 2i', 0],
      ['i³', '−i', 'i', -1, 1],
      ['√(−16)', '4i', -4, 4, '−4i'],
      ['What is the conjugate of 5 − 2i?', '5 + 2i', '−5 + 2i', '−5 − 2i', '2 − 5i'],
      ['(3 + 4i)(3 − 4i)', 25, -7, '9 + 16i', 5],
      ['What is the real part of (2 + 3i)(1 + i)?', -1, 5, 2, -3],
      ['(6 + 2i)/2', '3 + i', '3 + 2i', '6 + i', '3i'],
      ['i¹⁰', -1, 1, 'i', '−i'],
    ],
  },
};
