export function IncludeUnicodeText(text:string,query:string): boolean{
    const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, '')
    const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, '')
    const regex = new RegExp(normalizedQuery, 'i')
    return regex.test(normalizedText)
}