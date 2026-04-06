param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [string]$SheetName = 'Sheet1$'
)

function Get-AdjustedPrice {
    param(
        [double]$Price
    )

    if ($Price -lt 10) {
        return [Math]::Round($Price * 1.4, 2)
    }

    if ($Price -le 100) {
        return [Math]::Round($Price * 1.3, 2)
    }

    return [Math]::Round($Price * 1.25, 2)
}

$connectionString = "Driver={Microsoft Excel Driver (*.xls, *.xlsx, *.xlsm, *.xlsb)};Dbq=$SourcePath;ReadOnly=1;"
$connection = New-Object System.Data.Odbc.OdbcConnection($connectionString)
$connection.Open()

try {
    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT * FROM [$sheetName]"

    $adapter = New-Object System.Data.Odbc.OdbcDataAdapter($command)
    $table = New-Object System.Data.DataTable
    [void]$adapter.Fill($table)

    if ($table.Rows.Count -lt 4) {
        throw 'Workbook does not contain enough rows to detect headers and data.'
    }

    $headers = [ordered]@{}
    foreach ($column in $table.Columns) {
        $headerValue = $table.Rows[2][$column.ColumnName]
        if ($null -ne $headerValue) {
            $headerText = $headerValue.ToString().Trim()
            if ($headerText) {
                $headers[$column.ColumnName] = $headerText
            }
        }
    }

    $priceHeader = $headers['F1']

    $records = New-Object System.Collections.Generic.List[object]

    for ($i = 3; $i -lt $table.Rows.Count; $i++) {
        $row = $table.Rows[$i]
        $name = $row['F10']
        $code = $row['F13']
        $priceCell = $row['F1']

        $hasIdentity = ($null -ne $name -and $name.ToString().Trim()) -or ($null -ne $code -and $code.ToString().Trim())
        if (-not $hasIdentity) {
            continue
        }

        if ($null -eq $priceCell -or -not $priceCell.ToString().Trim()) {
            continue
        }

        $price = [double]::Parse($priceCell.ToString(), [Globalization.CultureInfo]::InvariantCulture)

        $item = [ordered]@{}
        foreach ($pair in $headers.GetEnumerator()) {
            $value = $row[$pair.Key]
            $item[$pair.Value] = if ($null -eq $value) { $null } else { $value.ToString().Trim() }
        }

        $item[$priceHeader] = Get-AdjustedPrice -Price $price
        $records.Add([pscustomobject]$item)
    }

    $json = $records | ConvertTo-Json -Depth 3
    [System.IO.File]::WriteAllText($outputPath, $json, [System.Text.UTF8Encoding]::new($false))

    Write-Output "OUTPUT_PATH=$outputPath"
    Write-Output "RECORDS_COUNT=$($records.Count)"
}
finally {
    $connection.Close()
    $connection.Dispose()
}
