import { IExamPerfomance, IQuestion, IStatisticResponse, QuestionCategory } from "../interfaces";

/**
 * Calculates the performance of user in the found categories of the questions parameter
 * @param questions A set of questions useful to calculate the statistics
 */
export function getStatistics(questions: IQuestion<any>[]): IStatisticResponse {
    // Creates an empty object to save the performance of users
    const performance: Record<QuestionCategory, IExamPerfomance> = {}
    let count = 0;

    // Loops through each question and updates the category's performance based on user results
    questions.forEach(question => {
        const category: QuestionCategory = question.category.toUpperCase()

        // Retrieves the current category's performance data from the object or creates new data if no data is found for the category
        let categoryPerformance = performance[category]
        categoryPerformance = categoryPerformance ? {
            count: categoryPerformance.count + 1,
            correctAnswers: [...categoryPerformance.correctAnswers, question._id.toString()]
        } : {
            count: 1,
            correctAnswers: [question._id.toString()]
        };

        count++
        // Updates the category's performance data within the object
        performance[category] = categoryPerformance
    })


    let bestCategory: string, worstCategory: string;
    const sortedPerformanceArray = Object.entries(performance).sort((a, b) => a[1].count + b[1].count)
    bestCategory = sortedPerformanceArray[0][0]
    worstCategory = sortedPerformanceArray.at(-1)[0]

    const statistics = {
        count,
        bestCategory, worstCategory,
        categoriesPerformance: performance,
    }

    return statistics
}