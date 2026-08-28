import html2canvas from 'html2canvas'

export async function captureElement(el: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(el, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    scale: 2,
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('生成图片失败'))),
      'image/png',
      0.92,
    )
  })
}
