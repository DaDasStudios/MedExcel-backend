
/**
 * Stores the user performance in a certain category which allows to calculate the statistics
 */
export interface IExamPerfomance {
    correctAnswers: string[];
    count: number
}

export type QuestionCategory = string

/**
 * Stores the results of a finished exam
 */
export interface IScoreHistory {
    startedAt: Date
    finishedAt: Date
    questions: string[]
    correctAnswers: string[]
    score: number
}

export type StatisticsMeasurements = {
    accuracyPercentage: number
}

/**
 * 
 */
export interface IStatisticResponse {
    count: number
    categoriesPerformance: Record<QuestionCategory, IExamPerfomance>
    bestCategory: string
    worstCategory: string
}