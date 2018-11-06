class UserGridOperator {

    constructor(gridId) {
       this.gridId = gridId
        this.editIndex = undefined;
    }



    endEditing() {
        if (typeof(this.editIndex) == 'undefined') {
            return true
        }

        if ($('#'+this.gridId).datagrid('validateRow', this.editIndex)) {

            console.log("this.editIndex " +this.editIndex)
            //console.log(JSON.stringify($('#'+this.gridId).datagrid()))
            //$('#sys_user_datagrid').datagrid('endEdit', this.editIndex);
            //$('#'+this.gridId).datagrid('endEdit', this.editIndex);
            this.editIndex = undefined;
            return true;
        } else {
            return false;
        }
    }


    onClickCell(index, field) {
        if (this.editIndex != index) {
            if (this.endEditing()) {
                $('#'+this.gridId).datagrid('selectRow', index)
                    .datagrid('beginEdit', index);
                var ed = $('#'+this.gridId).datagrid('getEditor', {index: index, field: field});
                if (ed) {
                    ($(ed.target).data('textbox') ? $(ed.target).textbox('textbox') : $(ed.target)).focus();
                }
                this.editIndex = index;
            } else {
                setTimeout(function () {
                    $('#'+this.gridId).datagrid('selectRow', this.editIndex);
                }, 0);
            }
        }
    }


    // 需要重写
  /*  onEndEdit(index, row) {
        alert('end dit')
        var ed = $(this).datagrid('getEditor', {
            index: index,
            field: 'id'
        });
        row.productname = $(ed.target).combobox('options').text;
    }*/


    append() {
        if (this.endEditing()) {
            $('#'+this.gridId).datagrid('appendRow', {});
            this.editIndex = $('#'+this.gridId).datagrid('getRows').length - 1;
            $('#'+this.gridId).datagrid('selectRow', this.editIndex)
                .datagrid('beginEdit', this.editIndex);
        }
    }


    removeit() {
        if (this.editIndex == undefined) {
            return
        }
        $('#'+this.gridId).datagrid('cancelEdit', this.editIndex)
            .datagrid('deleteRow', this.editIndex);
        this.editIndex = undefined;
    }


    accept() {
        if (this.endEditing()) {
            $('#'+this.gridId).datagrid('acceptChanges');
        }
    }


    reject() {
        $('#'+this.gridId).datagrid('rejectChanges');
        this.editIndex = undefined;
    }


    getChanges() {
        var rows = $('#'+this.gridId).datagrid('getChanges');
        alert(rows.length + ' rows are changed!');
    }

}