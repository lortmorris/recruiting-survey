
const question = q => (`<div class="col itemSection">${q}</div>`)
const lastExperience = () => {
  const year = new Date().getFullYear();
  let str = `<div class="col"> Last Experience:
  <select class="itemSection">
    <option value=''>Never</option>
  `;
  for (let i = 1980; i <= year; i++) {
    str+=`<option value="${i}">${i}</option>`
  }
  str+='</select></div>';
  return str;
}

const experience = () => {
  const opts = Array(20).fill(0).map((a, b) => `<option value="${b}">${b}</option>`).join('');
  return `<div class="col">Years of Experience:
  <select class="itemSection">${opts}</select>
  </div>`;
}

const removeItem = () => {
  const el = '<div class="col"><button class="removeItem">[X]</button></div>';
  return el;
}

const item = (index, q, key) => {
  window.metadata[1].options = window.metadata[1].options.filter(i => i != q);
  const html = (`<div class="list-group-item list-group-item-action flex-column">
    <div class="d-flex w-100 justify-content-between ${key}Item">
      ${question(q)}
      ${experience()}
      ${lastExperience()}
      ${removeItem()}
      </div>
    </div>`);
    const inserted = $(`#${key}Items`).append(html);
    const els = $(`.${key}Item .removeItem`);

    const last = els[els.length -1 ];
    $(last).click(function(){
      console.info('click!');
      $(last).parent().parent().parent().remove();
      window.metadata[index].options.push(q);
    });
}


$(document).ready(() => {
  $.ajax({
  url: "/data",
}).done(function(data) {
    window.metadata = data;
    const createDrop = (id, index) => {
      $( `#${id}` ).val('');
      $(`#${id}`).autocomplete({
        source: window.metadata[index].options,
        autoFocus: false,
        select: function(a, b) {
          $( `#${id}` ).autocomplete( "destroy" );
          item(index, b.item.label, id);
          window.metadata[index].options = window.metadata[index].options.filter(i => i!== b.item.label);
          createDrop(id, index);
        }
      });
    };
    createDrop('plangs', 2);
    createDrop('jlibs', 1);
    createDrop('javafw', 0);
    createDrop('qtools', 3);

    $('#form').submit(function(event, b){
      event.preventDefault();

      const email = $('#userEmail').val();
      const processItems = (key) => {
          const items = $(`.${key}Item`);
          const finalData = [];

          for (let x=0; x < items.length; x++) {
            const sections = $(items[x]).find('.itemSection');
            const years = sections[1].value;
            finalData.push({
              title: sections[0].innerText,
              years: sections[1].value,
              lastYear: sections[2].value,
              email,
              key,
            })
          }
          return finalData;
      };

      const finalResult = []
      .concat(processItems('plangs'))
      .concat(processItems('jlibs'))
      .concat(processItems('javafw'))
      .concat(processItems('qtools'))

      console.info(finalResult);
      $.ajax({
        type: "POST",
        url: '/save',
        data: JSON.stringify(finalResult),
        contentType: "application/json; charset=utf-8",
        success: function() {
          alert('Thanks for you time!');
        },
        processData: false,
        dataType: 'json',
      });

    });

  });
})
