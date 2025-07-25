import { useEffect } from 'react'

const PromptPassword = () => {
    useEffect(() => {
        const { ApperUI } = window.ApperSDK
        ApperUI.showPromptPassword('#authentication-prompt-password')
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 py-12 px-5 flex justify-center items-center">
                <div id="authentication-prompt-password" className="bg-white dark:bg-gray-800 mx-auto w-[400px] max-w-full p-10 rounded-2xl shadow-lg"></div>
            </div>
        </div>
    )
}

export default PromptPassword