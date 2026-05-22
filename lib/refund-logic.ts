export function calculateRefund(params: {
  totalPaid: number
  totalClasses: number
  classesUsed: number
}): {
  costPerClass: number
  classesRefunded: number
  refundAmount: number
} {
  const costPerClass = params.totalPaid / params.totalClasses
  const classesRefunded = params.totalClasses - params.classesUsed
  const refundAmount = Math.round(classesRefunded * costPerClass * 100) / 100
  return { costPerClass, classesRefunded, refundAmount }
}
