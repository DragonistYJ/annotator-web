module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: {
            '/annotator': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                pathRewrite: {
                    "/annotator": "/"
                }
            },
        }
    }
}