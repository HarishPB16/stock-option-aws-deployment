import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeJsIQComponent } from './node-js-iq.component';

describe('NodeJsIQComponent', () => {
  let component: NodeJsIQComponent;
  let fixture: ComponentFixture<NodeJsIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeJsIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeJsIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
